'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Fetch all layers
export async function getGisLayers() {
  try {
    const layers = await prisma.gisLayer.findMany({
      orderBy: { order: 'asc' },
    });
    return { success: true, data: layers };
  } catch (error: any) {
    console.error('Error fetching GIS layers:', error);
    return { success: false, error: error.message };
  }
}

// Fetch all features
export async function getGisFeatures() {
  try {
    const features = await prisma.gisFeature.findMany();
    return { success: true, data: features };
  } catch (error: any) {
    console.error('Error fetching GIS features:', error);
    return { success: false, error: error.message };
  }
}

// Save or Update Feature
export async function saveGisFeature(layerId: string, featureId: string | null, type: string, coordinates: string, properties: string) {
  try {
    if (featureId) {
      const updated = await prisma.gisFeature.update({
        where: { id: featureId },
        data: { coordinates, properties }
      });
      revalidatePath('/[lang]/staff/(dashboard)/gis');
      return { success: true, data: updated };
    } else {
      const created = await prisma.gisFeature.create({
        data: {
          layerId,
          type,
          coordinates,
          properties
        }
      });
      revalidatePath('/[lang]/staff/(dashboard)/gis');
      return { success: true, data: created };
    }
  } catch (error: any) {
    console.error('Error saving GIS feature:', error);
    return { success: false, error: error.message };
  }
}

// Delete feature
export async function deleteGisFeature(id: string) {
  try {
    await prisma.gisFeature.delete({ where: { id } });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Init basic layers if empty
export async function initDefaultLayers() {
  const count = await prisma.gisLayer.count();
  if (count === 0) {
    await prisma.gisLayer.createMany({
      data: [
        { name: 'Custom Drawings', nameAr: 'رسم حر', category: 'custom', color: '#8b5cf6', order: 1 },
        { name: 'Projects Area', nameAr: 'مناطق المشاريع', category: 'project', color: '#3b82f6', order: 2 },
        { name: 'Restricted Zones', nameAr: 'مناطق محظورة', category: 'reserve', color: '#ef4444', order: 3 },
      ]
    });
  }
}

// Create new Layer
export async function createGisLayer(data: { name: string, nameAr: string, category: string, color: string }) {
  try {
    const created = await prisma.gisLayer.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        category: data.category,
        color: data.color,
        order: 99
      }
    });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true, data: created };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete Layer
export async function deleteGisLayer(id: string) {
  try {
    // Check if layer has features
    const count = await prisma.gisFeature.count({ where: { layerId: id } });
    if (count > 0) {
      return { success: false, error: 'لا يمكن حذف الطبقة لأنها تحتوي على عناصر مرسومة.' };
    }
    await prisma.gisLayer.delete({ where: { id } });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Fetch External Layers (Reserves, Violations, EIA, Monitoring)
export async function getExternalLayers() {
  try {
    // Map Reserves to GISFeatures
    const reserves = await prisma.reserveProfile.findMany();
    const reserveFeatures = reserves.filter(r => r.coords).map(r => {
      let coords = [];
      try { coords = JSON.parse(r.coords); } catch(e){}
      return {
        id: `res-${r.id}`,
        layerId: 'layer-reserves',
        type: 'Polygon',
        coordinates: coords,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        properties: JSON.stringify({
          name: r.name,
          nameAr: r.nameAr,
          description: r.description,
          descriptionAr: r.descriptionAr,
          status: r.status,
          images: r.imageUrl ? [r.imageUrl] : []
        })
      };
    });

    // Map Violations to GISFeatures
    const violations = await prisma.violation.findMany();
    const violationFeatures = violations.map(v => ({
      id: `viol-${v.id}`,
      layerId: 'layer-violations',
      type: 'Point',
      coordinates: [v.locationLat, v.locationLng],
      createdAt: v.date,
      updatedAt: v.date,
      properties: JSON.stringify({
        name: `Violation: ${v.code || 'Unknown'}`,
        nameAr: `بلاغ: ${v.code || 'غير معروف'}`,
        description: v.description || v.actionTaken || '',
        descriptionAr: v.description || v.actionTaken || '',
        status: v.status,
      })
    }));

    // Map EiaInspections to GISFeatures
    const eiaInspections = await prisma.eiaInspection.findMany();
    const inspectionFeatures = eiaInspections.map(i => ({
      id: `eia-insp-${i.id}`,
      layerId: 'layer-eia-inspections',
      type: 'Point',
      coordinates: [i.latitude, i.longitude],
      createdAt: i.createdAt || i.date,
      updatedAt: i.updatedAt || i.date,
      properties: JSON.stringify({
        name: `EIA Inspection: ${i.locationName}`,
        nameAr: `معاينة بيئية: ${i.locationName}`,
        description: `Inspector: ${i.inspectorName}. Date: ${new Date(i.date).toLocaleDateString()}. Created By: ${i.createdBy}`,
        descriptionAr: `المعاين: ${i.inspectorName}. التاريخ: ${new Date(i.date).toLocaleDateString()}. بواسطة: ${i.createdBy}`,
        status: 'completed',
        reportFileUrl: i.reportFileUrl,
        studyFileUrl: i.studyFileUrl
      })
    }));

    // Map EiaViolations to GISFeatures
    const eiaViolations = await prisma.eiaViolation.findMany();
    const eiaViolationFeatures = eiaViolations.map(v => ({
      id: `eia-viol-${v.id}`,
      layerId: 'layer-eia-violations',
      type: 'Point',
      coordinates: [v.latitude, v.longitude],
      createdAt: v.createdAt || v.date,
      updatedAt: v.updatedAt || v.date,
      properties: JSON.stringify({
        name: `EIA Violation: ${v.type}`,
        nameAr: `مخالفة بيئية: ${v.type}`,
        description: `Entity: ${v.entityName} (${v.entityType}). Location: ${v.locationName}. Date: ${new Date(v.date).toLocaleDateString()}`,
        descriptionAr: `الجهة: ${v.entityName} (${v.entityType === 'PROJECT' ? 'مشروع' : 'شخص'}). الموقع: ${v.locationName}. التاريخ: ${new Date(v.date).toLocaleDateString()}`,
        status: 'critical',
      })
    }));

    // Map EiaAccidents to GISFeatures
    const eiaAccidents = await prisma.eiaAccident.findMany();
    const accidentFeatures = eiaAccidents.map(a => ({
      id: `eia-acc-${a.id}`,
      layerId: 'layer-eia-accidents',
      type: 'Point',
      coordinates: [a.latitude, a.longitude],
      createdAt: a.createdAt || a.date,
      updatedAt: a.updatedAt || a.date,
      properties: JSON.stringify({
        name: `EIA Accident: ${a.type}`,
        nameAr: `حادث بيئي: ${a.type}`,
        description: `${a.description}. Location: ${a.locationName}. Date: ${new Date(a.date).toLocaleDateString()}`,
        descriptionAr: `${a.description}. الموقع: ${a.locationName}. التاريخ: ${new Date(a.date).toLocaleDateString()}`,
        status: 'critical',
        reportFileUrl: a.reportFileUrl
      })
    }));

    // Map EcoProgramReports to GISFeatures
    const ecoReports = await prisma.ecoProgramReport.findMany();
    const ecoReportFeatures = ecoReports.map(r => ({
      id: `eco-rep-${r.id}`,
      layerId: 'layer-eco-reports',
      type: 'Point',
      coordinates: [r.latitude, r.longitude],
      createdAt: r.createdAt || r.date,
      updatedAt: r.updatedAt || r.date,
      properties: JSON.stringify({
        name: `Monitoring: ${r.program} (${r.subType || ''})`,
        nameAr: `رصد بيئي: ${r.program} (${r.subType || ''})`,
        description: `Observer: ${r.observerName}. Location: ${r.location}. Details: ${r.details || ''}`,
        descriptionAr: `الراصد: ${r.observerName}. الموقع: ${r.location}. التفاصيل: ${r.details || ''}`,
        status: 'active',
        attachedFileUrl: r.attachedFileUrl
      })
    }));

    // Map StrandingCases to GISFeatures
    const strandings = await prisma.strandingCase.findMany();
    const strandingFeatures = strandings.map(s => ({
      id: `eco-str-${s.id}`,
      layerId: 'layer-strandings',
      type: 'Point',
      coordinates: [s.latitude, s.longitude],
      createdAt: s.createdAt || s.date,
      updatedAt: s.updatedAt || s.date,
      properties: JSON.stringify({
        name: `Stranding: ${s.species || 'Unknown'} (${s.status})`,
        nameAr: `حالة نفوق/إنقاذ: ${s.speciesAr || s.species || 'غير معروف'} (${s.status === 'DEAD' ? 'نافق' : 'حي'})`,
        description: `Location: ${s.location}. Description: ${s.description || ''}`,
        descriptionAr: `الموقع: ${s.location}. التفاصيل: ${s.description || ''}`,
        status: s.status === 'DEAD' ? 'critical' : 'pending',
        attachedFileUrl: s.attachedFileUrl
      })
    }));

    // Map Sightings to GISFeatures
    const sightings = await prisma.sighting.findMany();
    const sightingFeatures = sightings.map(s => ({
      id: `eco-sig-${s.id}`,
      layerId: 'layer-sightings',
      type: 'Point',
      coordinates: [s.latitude, s.longitude],
      createdAt: s.createdAt || s.date,
      updatedAt: s.updatedAt || s.date,
      properties: JSON.stringify({
        name: `Wildlife Sighting: ${s.species} (Count: ${s.count})`,
        nameAr: `رصد كائنات: ${s.speciesAr || s.species} (العدد: ${s.count})`,
        description: `Observer: ${s.observerName}. Location: ${s.location}. Notes: ${s.notes || ''}`,
        descriptionAr: `الراصد: ${s.observerName}. الموقع: ${s.location}. ملاحظات: ${s.notes || ''}`,
        status: 'active',
      })
    }));

    // Map BeachSurveys to GISFeatures
    const beachSurveys = await prisma.beachSurvey.findMany();
    const beachSurveyFeatures = beachSurveys.map(s => ({
      id: `eco-bch-${s.id}`,
      layerId: 'layer-beach-surveys',
      type: 'Point',
      coordinates: [s.latitude, s.longitude],
      createdAt: s.createdAt || s.date,
      updatedAt: s.updatedAt || s.date,
      properties: JSON.stringify({
        name: `Beach Survey: ${s.location}`,
        nameAr: `مسح شاطئي: ${s.location}`,
        description: `${s.description || ''}`,
        descriptionAr: `${s.description || ''}`,
        status: 'active',
        attachedFileUrl: s.attachedFileUrl
      })
    }));

    return { 
      success: true, 
      data: {
        reserveFeatures,
        violationFeatures,
        inspectionFeatures,
        eiaViolationFeatures,
        accidentFeatures,
        ecoReportFeatures,
        strandingFeatures,
        sightingFeatures,
        beachSurveyFeatures
      } 
    };
  } catch (error: any) {
    console.error('Error fetching external layers:', error);
    return { success: false, error: error.message };
  }
}


// Update Layer Opacity
export async function updateLayerOpacity(id: string, opacity: number) {
  try {
    if (id.startsWith('layer-')) return { success: true }; // Virtual layer
    await prisma.gisLayer.update({
      where: { id },
      data: { opacity }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update Layer Order
export async function updateLayerOrder(id: string, order: number) {
  try {
    if (id.startsWith('layer-')) return { success: true }; // Virtual layer
    await prisma.gisLayer.update({
      where: { id },
      data: { order }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Update Layer Details
export async function updateGisLayer(id: string, data: { name: string, nameAr: string, category: string, color: string }) {
  try {
    if (id.startsWith('layer-')) return { success: false, error: 'Cannot modify system layers.' };
    const updated = await prisma.gisLayer.update({
      where: { id },
      data: {
        name: data.name,
        nameAr: data.nameAr,
        category: data.category,
        color: data.color
      }
    });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Bulk delete features
export async function bulkDeleteGisFeatures(ids: string[]) {
  try {
    await prisma.gisFeature.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Bulk move features to a different layer
export async function bulkMoveGisFeatures(ids: string[], targetLayerId: string) {
  try {
    await prisma.gisFeature.updateMany({
      where: {
        id: { in: ids }
      },
      data: {
        layerId: targetLayerId
      }
    });
    revalidatePath('/[lang]/staff/(dashboard)/gis');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

