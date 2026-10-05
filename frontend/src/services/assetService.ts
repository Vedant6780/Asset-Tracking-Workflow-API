/**
 * Asset service - handles all asset-related API calls.
 *
 * Provides CRUD operations and status updates for asset tracking.
 *
 * Endpoints covered:
 * - GET /api/v1/assets - List all assets (manager/admin only)
 * - GET /api/v1/assets/:id - Get single asset with audit history
 * - POST /api/v1/assets - Create new asset (manager/admin only)
 * - PUT /api/v1/assets/:id/status - Update status (operator & manager)
 * - GET /api/v1/assets/lookup/:serial_number - Lookup by serial (operator & manager)
 * - DELETE /api/v1/assets/:id - Delete asset (manager/admin only)
 */

import { api } from './apiClient';
import type {
    AssetResponse,
    AssetDetailResponse,
    AssetCreate,
    StatusUpdate,
    StatusUpdateResponse,
    AssetLookupResponse,
    PaginatedResponse
} from '../types/assets';

// List all assets with pagination and filtering
export const listAssets = async (
    page: number = 1,
    pageSize: number = 20,
    filters?: {
        status?: string;
        category?: string;
        operatorId?: string;
        search?: string;
    }
): Promise<PaginatedResponse<AssetResponse>> => {
    // Build query string from filters
    const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
    });

    if (filters) {
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('category', filters.category);
        if (filters.operatorId) params.append('operator_id', filters.operatorId);
        if (filters.search) params.append('search', filters.search);
    }

    const response = await api.get<PaginatedResponse<AssetResponse>>(`/assets?${params.toString()}`);
    return response.data;
};

// Get single asset with full audit history
export const getAsset = async (assetId: number): Promise<AssetDetailResponse> => {
    const response = await api.get<AssetDetailResponse>(`/assets/${assetId}`);
    return response.data;
};

// Create new asset
export const createAsset = async (
    payload: AssetCreate,
    _currentUserRole: string
): Promise<AssetResponse> => {
    // Manager/admin only - backend validates role
    const response = await api.post<AssetResponse>('/assets', payload);
    return response.data;
};

// Update asset status (available to both operators and managers)
export const updateAssetStatus = async (
    assetId: number,
    payload: StatusUpdate
): Promise<StatusUpdateResponse> => {
    const response = await api.put<StatusUpdateResponse>(`/assets/${assetId}/status`, payload);
    return response.data;
};

// Lookup asset by serial number (available to operators and managers)
export const lookupAsset = async (serialNumber: string): Promise<AssetLookupResponse> => {
    const response = await api.get<AssetLookupResponse>(`/assets/lookup/${serialNumber}`);
    return response.data;
};

// Delete asset (manager/admin only)
export const deleteAsset = async (assetId: number): Promise<void> => {
    await api.delete<void>(`/assets/${assetId}`);
};