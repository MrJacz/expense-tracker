import { PrismaClient } from '@prisma/client';
import { 
  BankIntegration, 
  SyncOptions, 
  SyncResult, 
  IntegrationRecord, 
  IntegrationConfig, 
  CreateIntegrationRequest 
} from '@/types/integrations';
import { BaseIntegration } from './base';
import { UPBankIntegration, createUPBankIntegration } from './upbank';

export class IntegrationManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new integration
   */
  async createIntegration(userId: string, request: CreateIntegrationRequest): Promise<IntegrationRecord> {
    // Validate configuration first
    const integration = this.instantiateIntegration(request.type, request.config, userId);
    const validation = await integration.validateConfig(request.config);
    
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Create integration record
    const integrationRecord = await this.prisma.integration.create({
      data: {
        userId,
        name: request.name,
        type: request.type,
        apiSource: request.config.apiSource,
        config: request.config,
        isActive: true,
        isVerified: true // Already validated above
      }
    });

    return this.mapPrismaToIntegrationRecord(integrationRecord);
  }

  /**
   * Get integration by ID
   */
  async getIntegration(integrationId: string): Promise<IntegrationRecord | null> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId }
    });

    return integration ? this.mapPrismaToIntegrationRecord(integration) : null;
  }

  /**
   * Get all integrations for a user
   */
  async getUserIntegrations(userId: string): Promise<IntegrationRecord[]> {
    const integrations = await this.prisma.integration.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return integrations.map(this.mapPrismaToIntegrationRecord);
  }

  /**
   * Update integration
   */
  async updateIntegration(integrationId: string, updates: Partial<IntegrationConfig>): Promise<IntegrationRecord> {
    const integration = await this.prisma.integration.findUnique({
      where: { id: integrationId }
    });

    if (!integration) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const updatedConfig = { ...integration.config, ...updates };
    
    // Validate updated configuration
    const instance = this.instantiateIntegration(integration.type, updatedConfig, integration.userId);
    const validation = await instance.validateConfig(updatedConfig);
    
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    const updatedIntegration = await this.prisma.integration.update({
      where: { id: integrationId },
      data: {
        config: updatedConfig,
        isVerified: true
      }
    });

    return this.mapPrismaToIntegrationRecord(updatedIntegration);
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    await this.prisma.integration.delete({
      where: { id: integrationId }
    });
  }

  /**
   * Test connection for an integration
   */
  async testConnection(integrationId: string): Promise<boolean> {
    const integrationRecord = await this.getIntegration(integrationId);
    if (!integrationRecord) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const integration = this.instantiateIntegration(
      integrationRecord.type, 
      integrationRecord.config, 
      integrationRecord.userId
    );

    return await integration.testConnection();
  }

  /**
   * Sync data for an integration
   */
  async syncData(integrationId: string, options?: SyncOptions): Promise<SyncResult> {
    const integrationRecord = await this.getIntegration(integrationId);
    if (!integrationRecord) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    const integration = this.instantiateIntegration(
      integrationRecord.type, 
      integrationRecord.config, 
      integrationRecord.userId
    );

    return await integration.syncData(integrationRecord.userId, options);
  }

  /**
   * Get available integration types
   */
  getAvailableIntegrationTypes(): string[] {
    return ['upbank', 'csv']; // Add more as we implement them
  }

  /**
   * Instantiate an integration from config
   */
  private instantiateIntegration(type: string, config: IntegrationConfig, userId: string): BankIntegration {
    // Create a temporary integration record for instantiation
    const tempRecord: IntegrationRecord = {
      id: 'temp',
      userId,
      name: config.name,
      type,
      apiSource: config.apiSource,
      config,
      isActive: true,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (type) {
      case 'upbank':
        return new UPBankIntegration(this.prisma, tempRecord);
      // Add more integration types here
      default:
        throw new Error(`Unsupported integration type: ${type}`);
    }
  }

  /**
   * Map Prisma model to IntegrationRecord
   */
  private mapPrismaToIntegrationRecord(integration: any): IntegrationRecord {
    return {
      id: integration.id,
      userId: integration.userId,
      name: integration.name,
      type: integration.type,
      apiSource: integration.apiSource,
      config: integration.config,
      isActive: integration.isActive,
      isVerified: integration.isVerified,
      lastSyncAt: integration.lastSyncAt,
      lastSyncStatus: integration.lastSyncStatus,
      lastErrorMessage: integration.lastErrorMessage,
      metadata: integration.metadata,
      createdAt: integration.createdAt,
      updatedAt: integration.updatedAt
    };
  }
}

// Export integration classes
export { BaseIntegration, UPBankIntegration };

// Export factory functions
export { createUPBankIntegration };

// Helper function to create integration manager
export function createIntegrationManager(prisma: PrismaClient): IntegrationManager {
  return new IntegrationManager(prisma);
}

// Types re-export for convenience
export * from '@/types/integrations';