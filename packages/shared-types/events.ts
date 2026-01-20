export enum AuditEventType {
    DOCUMENT_CREATED = 'DOCUMENT_CREATED',
    DOCUMENT_SENT = 'DOCUMENT_SENT',
    DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
    OTP_REQUESTED = 'OTP_REQUESTED',
    OTP_VALIDATED = 'OTP_VALIDATED',
    DOCUMENT_SIGNED = 'DOCUMENT_SIGNED',
    DOCUMENT_REJECTED = 'DOCUMENT_REJECTED'
}

export interface AuditEventPayload {
    ipAddress: string;
    userAgent: string;
    action: AuditEventType;
    metadata?: Record<string, any>;
}
