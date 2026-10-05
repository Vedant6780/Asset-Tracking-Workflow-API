/**
 * Asset type definitions for Workflow Asset Tracker.
 *
 * Contains request/response types for all asset endpoints.
 */

export interface AssetCreate {
    name: string;
    serial_number: string;
    location: string;
}

export interface AssetResponse {
    id: number;
    name: string;
    serial_number: string;
    status: string;
    location: string;
    created_at: string;
    updated_at: string;
}

export interface AssetDetailResponse {
    id: number;
    name: string;
    serial_number: string;
    status: string;
    location: string;
    created_at: string;
    updated_at: string;
    audit_logs: AuditLogResponse[];
}

export interface StatusUpdate {
    new_status: string;
    location?: string | null;
}

export interface StatusUpdateResponse {
    asset_id: number;
    new_status: string;
    location: string;
    updated_at: string;
}

export interface AssetLookupResponse {
    id: number;
    name: string;
    serial_number: string;
    status: string;
    location: string;
    created_at: string;
    updated_at: string;
}

export interface AuditLogResponse {
    id: number;
    asset_id: number;
    action: string;
    old_status?: string | null;
    new_status: string;
    old_location?: string | null;
    new_location?: string | null;
    changed_by: string;
    changed_at: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export type AssetStatus =
    | 'Registered'
    | 'In Warehouse'
    | 'In Transit'
    | 'Delivered'
    | 'Under Maintenance'
    | 'Decommissioned'
    | 'Damaged';

export interface AssetFilters {
    status?: AssetStatus;
    search?: string;
    category?: string;
    operatorId?: string;
}