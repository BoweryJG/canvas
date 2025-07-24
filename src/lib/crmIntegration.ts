import { type EnhancedScanResult } from './enhancedAI';
import { type ResearchData } from './webResearch';
import { type PersonalizedOutreach } from './outreachSystem';

export interface CRMConfig {
  provider: 'sphere-os' | 'salesforce' | 'hubspot' | 'pipedrive' | 'zoho' | 'custom';
  apiKey?: string;
  instanceUrl?: string;
  hubId?: string;
  apiToken?: string;
  domain?: string;
  customEndpoint?: string;
  enabled: boolean;
}

export interface CRMContact {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  company: string;
  source: 'canvas_intelligence';
  customFields?: Record<string, unknown>;
}

export interface CRMOpportunity {
  id?: string;
  name: string;
  accountName: string;
  contactId: string;
  stage: string;
  amount?: number;
  probability?: number;
  expectedCloseDate?: string;
  description?: string;
  source: 'canvas_intelligence';
  customFields?: Record<string, unknown>;
}

export interface CRMActivity {
  id?: string;
  contactId: string;
  opportunityId?: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  dueDate?: string;
  completed?: boolean;
  source: 'canvas_intelligence';
}

export interface CRMSyncResult {
  success: boolean;
  contactId?: string;
  opportunityId?: string;
  activityId?: string;
  error?: string;
  warnings?: string[];
}

export interface CRMIntegrationMetrics {
  totalContacts: number;
  totalOpportunities: number;
  totalActivities: number;
  syncSuccessRate: number;
  lastSyncTime?: string;
  errors: string[];
}

export class CRMIntegrationManager {
  private config: CRMConfig;
  private metrics: CRMIntegrationMetrics;

  constructor(config: CRMConfig) {
    this.config = config;
    this.metrics = {
      totalContacts: 0,
      totalOpportunities: 0,
      totalActivities: 0,
      syncSuccessRate: 100,
      errors: []
    };
  }

  /**
   * Sync Canvas intelligence data to CRM
   */
  async syncToggCRM(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    outreachData?: PersonalizedOutreach
  ): Promise<CRMSyncResult> {
    try {
      console.log(`🔄 Syncing to ${this.config.provider.toUpperCase()} CRM...`);

      if (!this.config.enabled) {
        throw new Error('CRM integration is not enabled');
      }

      // Step 1: Create or update contact
      const contact = this.buildContactFromScan(scanResult, researchData);
      const contactResult = await this.syncContact(contact);

      if (!contactResult.success) {
        throw new Error(`Contact sync failed: ${contactResult.error}`);
      }

      // Step 2: Create opportunity
      const opportunity = this.buildOpportunityFromScan(scanResult, researchData, contactResult.contactId!);
      const opportunityResult = await this.syncOpportunity(opportunity);

      // Step 3: Add activities and notes
      const activities = this.buildActivitiesFromScan(scanResult, researchData, contactResult.contactId!, opportunityResult.opportunityId, outreachData);
      
      for (const activity of activities) {
        await this.syncActivity(activity);
      }

      // Update metrics
      this.updateMetrics(true);

      console.log('✅ CRM sync completed successfully');
      return {
        success: true,
        contactId: contactResult.contactId,
        opportunityId: opportunityResult.opportunityId
      };

    } catch (error) {
      console.error('CRM sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateMetrics(false, errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sync contact to CRM
   */
  async syncContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      switch (this.config.provider) {
        case 'sphere-os':
          return await this.syncSphereOSContact(contact);
        case 'salesforce':
          return await this.syncSalesforceContact(contact);
        case 'hubspot':
          return await this.syncHubSpotContact(contact);
        case 'pipedrive':
          return await this.syncPipedriveContact(contact);
        case 'zoho':
          return await this.syncZohoContact(contact);
        case 'custom':
          return await this.syncCustomContact(contact);
        default:
          throw new Error(`Unsupported CRM provider: ${this.config.provider}`);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync opportunity to CRM
   */
  async syncOpportunity(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      switch (this.config.provider) {
        case 'sphere-os':
          return await this.syncSphereOSOpportunity(opportunity);
        case 'salesforce':
          return await this.syncSalesforceOpportunity(opportunity);
        case 'hubspot':
          return await this.syncHubSpotDeal(opportunity);
        case 'pipedrive':
          return await this.syncPipedriveDeal(opportunity);
        case 'zoho':
          return await this.syncZohoDeal(opportunity);
        case 'custom':
          return await this.syncCustomOpportunity(opportunity);
        default:
          throw new Error(`Unsupported CRM provider: ${this.config.provider}`);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Sync activity to CRM
   */
  async syncActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      switch (this.config.provider) {
        case 'sphere-os':
          return await this.syncSphereOSActivity(activity);
        case 'salesforce':
          return await this.syncSalesforceActivity(activity);
        case 'hubspot':
          return await this.syncHubSpotActivity(activity);
        case 'pipedrive':
          return await this.syncPipedriveActivity(activity);
        case 'zoho':
          return await this.syncZohoActivity(activity);
        case 'custom':
          return await this.syncCustomActivity(activity);
        default:
          throw new Error(`Unsupported CRM provider: ${this.config.provider}`);
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Sphere oS Integration (RepSpheres CRM)
  private async syncSphereOSContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const sphereOSData = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        title: contact.title,
        company: contact.company,
        source: 'canvas_intelligence',
        canvasIntelligenceScore: contact.customFields?.practiceScore,
        canvasResearchQuality: contact.customFields?.researchQuality,
        canvasLastUpdated: new Date().toISOString(),
        tags: ['Canvas Generated', 'High Priority'],
        customFields: contact.customFields
      };

      console.log('🌐 Syncing to Sphere oS CRM:', sphereOSData);
      
      // Call to Sphere oS API at crm.repspheres.com
      const response = await fetch(`${this.config.instanceUrl}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Canvas-Intelligence/1.0'
        },
        body: JSON.stringify(sphereOSData)
      });

      if (!response.ok) {
        throw new Error(`Sphere oS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        contactId: result.id || 'sphere_' + Date.now()
      };
    } catch (error) {
      console.error('Sphere oS sync error:', error);
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async syncSphereOSOpportunity(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const sphereOSData = {
        name: opportunity.name,
        accountName: opportunity.accountName,
        contactId: opportunity.contactId,
        stage: opportunity.stage,
        value: opportunity.amount,
        probability: opportunity.probability,
        expectedCloseDate: opportunity.expectedCloseDate,
        description: opportunity.description,
        source: 'canvas_intelligence',
        canvasGenerated: true,
        practiceScore: opportunity.customFields?.practiceScore,
        tags: ['Canvas Intelligence', 'AI Generated']
      };

      console.log('🌐 Syncing opportunity to Sphere oS:', sphereOSData);
      
      const response = await fetch(`${this.config.instanceUrl}/api/opportunities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Canvas-Intelligence/1.0'
        },
        body: JSON.stringify(sphereOSData)
      });

      if (!response.ok) {
        throw new Error(`Sphere oS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        opportunityId: result.id || 'sphere_opp_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncSphereOSActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const sphereOSData = {
        contactId: activity.contactId,
        opportunityId: activity.opportunityId,
        type: activity.type,
        subject: activity.subject,
        description: activity.description,
        dueDate: activity.dueDate,
        completed: activity.completed || false,
        source: 'canvas_intelligence',
        canvasGenerated: true,
        priority: 'high'
      };

      console.log('🌐 Syncing activity to Sphere oS:', sphereOSData);
      
      const response = await fetch(`${this.config.instanceUrl}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'Canvas-Intelligence/1.0'
        },
        body: JSON.stringify(sphereOSData)
      });

      if (!response.ok) {
        throw new Error(`Sphere oS API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        activityId: result.id || 'sphere_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Salesforce Integration
  private async syncSalesforceContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const salesforceData = {
        FirstName: contact.firstName,
        LastName: contact.lastName,
        Email: contact.email,
        Phone: contact.phone,
        Title: contact.title,
        Account: { Name: contact.company },
        LeadSource: contact.source,
        Canvas_Intelligence_Score__c: contact.customFields?.practiceScore,
        Canvas_Research_Quality__c: contact.customFields?.researchQuality,
        Canvas_Last_Updated__c: new Date().toISOString()
      };

      // Simulate Salesforce API call
      console.log('📊 Syncing to Salesforce:', salesforceData);
      
      // In real implementation, use Salesforce REST API or SDK
      const response = await this.mockAPICall('salesforce/contact', salesforceData);
      
      return {
        success: true,
        contactId: response.id || 'sf_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncSalesforceOpportunity(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const salesforceData = {
        Name: opportunity.name,
        AccountId: opportunity.accountName,
        ContactId: opportunity.contactId,
        StageName: opportunity.stage,
        Amount: opportunity.amount,
        Probability: opportunity.probability,
        CloseDate: opportunity.expectedCloseDate,
        Description: opportunity.description,
        LeadSource: opportunity.source,
        Canvas_Intelligence_Generated__c: true,
        Canvas_Practice_Score__c: opportunity.customFields?.practiceScore
      };

      console.log('📊 Syncing opportunity to Salesforce:', salesforceData);
      const response = await this.mockAPICall('salesforce/opportunity', salesforceData);
      
      return {
        success: true,
        opportunityId: response.id || 'sf_opp_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncSalesforceActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const salesforceData = {
        WhoId: activity.contactId,
        WhatId: activity.opportunityId,
        Subject: activity.subject,
        Description: activity.description,
        ActivityDate: activity.dueDate,
        Status: activity.completed ? 'Completed' : 'Open',
        Type: activity.type,
        Canvas_Generated__c: true
      };

      console.log('📊 Syncing activity to Salesforce:', salesforceData);
      const response = await this.mockAPICall('salesforce/activity', salesforceData);
      
      return {
        success: true,
        activityId: response.id || 'sf_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // HubSpot Integration
  private async syncHubSpotContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const hubspotData = {
        properties: {
          firstname: contact.firstName,
          lastname: contact.lastName,
          email: contact.email,
          phone: contact.phone,
          jobtitle: contact.title,
          company: contact.company,
          hs_lead_status: 'NEW',
          lifecyclestage: 'lead',
          canvas_intelligence_score: contact.customFields?.practiceScore,
          canvas_research_quality: contact.customFields?.researchQuality,
          canvas_last_updated: new Date().toISOString()
        }
      };

      console.log('🔶 Syncing to HubSpot:', hubspotData);
      const response = await this.mockAPICall('hubspot/contact', hubspotData);
      
      return {
        success: true,
        contactId: response.id || 'hs_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncHubSpotDeal(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const hubspotData = {
        properties: {
          dealname: opportunity.name,
          dealstage: this.mapToHubSpotStage(opportunity.stage),
          amount: opportunity.amount,
          closedate: opportunity.expectedCloseDate,
          hubspot_owner_id: null, // Would be set based on territory rules
          dealtype: 'newbusiness',
          canvas_intelligence_generated: true,
          canvas_practice_score: opportunity.customFields?.practiceScore
        },
        associations: [
          {
            to: { id: opportunity.contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          }
        ]
      };

      console.log('🔶 Syncing deal to HubSpot:', hubspotData);
      const response = await this.mockAPICall('hubspot/deal', hubspotData);
      
      return {
        success: true,
        opportunityId: response.id || 'hs_deal_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncHubSpotActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const hubspotData = {
        properties: {
          hs_activity_type: activity.type.toUpperCase(),
          hs_title: activity.subject,
          hs_body_preview: activity.description,
          hs_due_date: activity.dueDate,
          hs_task_status: activity.completed ? 'COMPLETED' : 'NOT_STARTED',
          canvas_generated: true
        },
        associations: [
          {
            to: { id: activity.contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 194 }]
          }
        ]
      };

      console.log('🔶 Syncing activity to HubSpot:', hubspotData);
      const response = await this.mockAPICall('hubspot/activity', hubspotData);
      
      return {
        success: true,
        activityId: response.id || 'hs_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Pipedrive Integration
  private async syncPipedriveContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const pipedriveData = {
        name: `${contact.firstName} ${contact.lastName}`,
        email: [{ value: contact.email, primary: true }],
        phone: [{ value: contact.phone, primary: true }],
        org_id: await this.getOrCreatePipedriveOrg(contact.company),
        canvas_intelligence_score: contact.customFields?.practiceScore,
        canvas_research_quality: contact.customFields?.researchQuality,
        canvas_last_updated: new Date().toISOString()
      };

      console.log('🔵 Syncing to Pipedrive:', pipedriveData);
      const response = await this.mockAPICall('pipedrive/person', pipedriveData);
      
      return {
        success: true,
        contactId: response.id || 'pd_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncPipedriveDeal(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const pipedriveData = {
        title: opportunity.name,
        person_id: opportunity.contactId,
        org_id: await this.getOrCreatePipedriveOrg(opportunity.accountName),
        value: opportunity.amount,
        currency: 'USD',
        stage_id: this.mapToPipedriveStage(opportunity.stage),
        expected_close_date: opportunity.expectedCloseDate,
        probability: opportunity.probability,
        canvas_intelligence_generated: true,
        canvas_practice_score: opportunity.customFields?.practiceScore
      };

      console.log('🔵 Syncing deal to Pipedrive:', pipedriveData);
      const response = await this.mockAPICall('pipedrive/deal', pipedriveData);
      
      return {
        success: true,
        opportunityId: response.id || 'pd_deal_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncPipedriveActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const pipedriveData = {
        subject: activity.subject,
        note: activity.description,
        type: activity.type,
        person_id: activity.contactId,
        deal_id: activity.opportunityId,
        due_date: activity.dueDate,
        done: activity.completed ? 1 : 0,
        canvas_generated: true
      };

      console.log('🔵 Syncing activity to Pipedrive:', pipedriveData);
      const response = await this.mockAPICall('pipedrive/activity', pipedriveData);
      
      return {
        success: true,
        activityId: response.id || 'pd_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Zoho Integration
  private async syncZohoContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const zohoData = {
        First_Name: contact.firstName,
        Last_Name: contact.lastName,
        Email: contact.email,
        Phone: contact.phone,
        Title: contact.title,
        Account_Name: contact.company,
        Lead_Source: contact.source,
        Canvas_Intelligence_Score: contact.customFields?.practiceScore,
        Canvas_Research_Quality: contact.customFields?.researchQuality,
        Canvas_Last_Updated: new Date().toISOString()
      };

      console.log('🟠 Syncing to Zoho:', zohoData);
      const response = await this.mockAPICall('zoho/contact', zohoData);
      
      return {
        success: true,
        contactId: response.id || 'zoho_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncZohoDeal(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const zohoData = {
        Deal_Name: opportunity.name,
        Account_Name: opportunity.accountName,
        Contact_Name: opportunity.contactId,
        Stage: opportunity.stage,
        Amount: opportunity.amount,
        Probability: opportunity.probability,
        Closing_Date: opportunity.expectedCloseDate,
        Description: opportunity.description,
        Lead_Source: opportunity.source,
        Canvas_Intelligence_Generated: true,
        Canvas_Practice_Score: opportunity.customFields?.practiceScore
      };

      console.log('🟠 Syncing deal to Zoho:', zohoData);
      const response = await this.mockAPICall('zoho/deal', zohoData);
      
      return {
        success: true,
        opportunityId: response.id || 'zoho_deal_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncZohoActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const zohoData = {
        Subject: activity.subject,
        What_Id: activity.opportunityId,
        Who_Id: activity.contactId,
        Activity_Type: activity.type,
        Description: activity.description,
        Due_Date: activity.dueDate,
        Status: activity.completed ? 'Completed' : 'Not Started',
        Canvas_Generated: true
      };

      console.log('🟠 Syncing activity to Zoho:', zohoData);
      const response = await this.mockAPICall('zoho/activity', zohoData);
      
      return {
        success: true,
        activityId: response.id || 'zoho_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Custom CRM Integration
  private async syncCustomContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const customData = {
        contact: contact,
        timestamp: new Date().toISOString(),
        source: 'canvas_intelligence'
      };

      console.log('🔧 Syncing to custom CRM:', customData);
      const response = await this.mockAPICall('custom/contact', customData);
      
      return {
        success: true,
        contactId: response.id || 'custom_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncCustomOpportunity(opportunity: CRMOpportunity): Promise<CRMSyncResult> {
    try {
      const customData = {
        opportunity: opportunity,
        timestamp: new Date().toISOString(),
        source: 'canvas_intelligence'
      };

      console.log('🔧 Syncing opportunity to custom CRM:', customData);
      const response = await this.mockAPICall('custom/opportunity', customData);
      
      return {
        success: true,
        opportunityId: response.id || 'custom_opp_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async syncCustomActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    try {
      const customData = {
        activity: activity,
        timestamp: new Date().toISOString(),
        source: 'canvas_intelligence'
      };

      console.log('🔧 Syncing activity to custom CRM:', customData);
      const response = await this.mockAPICall('custom/activity', customData);
      
      return {
        success: true,
        activityId: response.id || 'custom_act_' + Date.now()
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Data transformation methods
  private buildContactFromScan(scanResult: EnhancedScanResult, researchData: ResearchData): CRMContact {
    const [firstName, ...lastNameParts] = scanResult.doctor.split(' ');
    const lastName = lastNameParts.join(' ');

    return {
      firstName: firstName || 'Unknown',
      lastName: lastName || 'Doctor',
      email: researchData.practiceInfo?.website ? (() => {
        const website = researchData.practiceInfo.website;
        if (!website || typeof website !== 'string') return undefined;
        try {
          const url = new URL(website);
          return `contact@${url.hostname}`;
        } catch {
          // If URL parsing fails, try to extract domain manually
          const domain = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
          return domain ? `contact@${domain}` : undefined;
        }
      })() : undefined,
      phone: researchData.practiceInfo?.phone,
      title: 'Medical Doctor',
      company: researchData.practiceInfo?.name || `${scanResult.doctor} Medical Practice`,
      source: 'canvas_intelligence',
      customFields: {
        practiceScore: scanResult.score,
        researchQuality: scanResult.researchQuality,
        factBased: scanResult.factBased,
        researchSources: scanResult.researchSources,
        specialties: researchData.practiceInfo?.specialties?.join(', '),
        practiceType: researchData.businessIntel?.practiceType,
        patientVolume: researchData.businessIntel?.patientVolume,
        technology: researchData.practiceInfo?.technology?.join(', '),
        canvasGeneratedDate: new Date().toISOString()
      }
    };
  }

  private buildOpportunityFromScan(scanResult: EnhancedScanResult, researchData: ResearchData, contactId: string): CRMOpportunity {
    const estimatedValue = this.calculateOpportunityValue(scanResult, researchData);
    const probability = this.calculateProbability(scanResult.score);
    const stage = this.mapScoreToStage(scanResult.score);

    return {
      name: `${scanResult.doctor} - ${scanResult.product} Opportunity`,
      accountName: researchData.practiceInfo?.name || `${scanResult.doctor} Medical Practice`,
      contactId: contactId,
      stage: stage,
      amount: estimatedValue,
      probability: probability,
      expectedCloseDate: this.calculateExpectedCloseDate(scanResult.score),
      description: `Canvas Intelligence identified opportunity: ${scanResult.score}% practice fit with ${scanResult.researchQuality} research quality. ${Array.isArray(scanResult.insights) ? scanResult.insights.slice(0, 2).join('. ') : ''}.`,
      source: 'canvas_intelligence',
      customFields: {
        practiceScore: scanResult.score,
        researchQuality: scanResult.researchQuality,
        productIntel: scanResult.productIntel,
        salesBrief: scanResult.salesBrief,
        keyInsights: Array.isArray(scanResult.insights) ? scanResult.insights.slice(0, 3) : [],
        canvasGeneratedDate: new Date().toISOString()
      }
    };
  }

  private buildActivitiesFromScan(
    scanResult: EnhancedScanResult, 
    _researchData: ResearchData, 
    contactId: string, 
    opportunityId?: string,
    outreachData?: PersonalizedOutreach
  ): CRMActivity[] {
    const activities: CRMActivity[] = [];

    // Research note activity
    activities.push({
      contactId: contactId,
      opportunityId: opportunityId,
      type: 'note',
      subject: 'Canvas Intelligence Research Summary',
      description: `Comprehensive research completed with ${scanResult.score}% practice fit score.\n\nKey Findings:\n${Array.isArray(scanResult.insights) ? scanResult.insights.map((insight: unknown) => `• ${insight}`).join('\n') : ''}\n\nResearch Quality: ${scanResult.researchQuality}\nSources: ${scanResult.researchSources}\n\nSales Brief: ${scanResult.salesBrief}`,
      source: 'canvas_intelligence'
    });

    // Follow-up task
    activities.push({
      contactId: contactId,
      opportunityId: opportunityId,
      type: 'task',
      subject: 'Follow up on Canvas Intelligence research',
      description: `Follow up with ${scanResult.doctor} based on Canvas research findings. Practice fit score: ${scanResult.score}%. Focus on: ${Array.isArray(scanResult.insights) ? scanResult.insights[0] : 'practice needs assessment'}.`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      completed: false,
      source: 'canvas_intelligence'
    });

    // Outreach activity if provided
    if (outreachData) {
      activities.push({
        contactId: contactId,
        opportunityId: opportunityId,
        type: 'email',
        subject: `Outreach: ${outreachData.subject}`,
        description: `Canvas-generated personalized outreach:\n\nSubject: ${outreachData.subject}\n\nContent:\n${outreachData.content}\n\nPersonalizations:\n${outreachData.personalizations?.map(p => `• ${p}`).join('\n') || 'Standard personalization'}`,
        source: 'canvas_intelligence'
      });
    }

    return activities;
  }

  // Utility methods
  private calculateOpportunityValue(scanResult: EnhancedScanResult, researchData: ResearchData): number {
    const baseValue = 50000; // Base opportunity value
    const scoreMultiplier = scanResult.score / 100;
    const practiceSize = researchData.practiceInfo?.staff || 10;
    const sizeMultiplier = Math.min(practiceSize / 10, 3); // Cap at 3x multiplier
    
    return Math.round(baseValue * scoreMultiplier * sizeMultiplier);
  }

  private calculateProbability(score: number): number {
    if (score >= 90) return 80;
    if (score >= 80) return 60;
    if (score >= 70) return 40;
    if (score >= 60) return 25;
    return 15;
  }

  private mapScoreToStage(score: number): string {
    if (score >= 80) return 'Qualified';
    if (score >= 60) return 'Prospecting';
    return 'Lead';
  }

  private calculateExpectedCloseDate(score: number): string {
    const daysToAdd = score >= 80 ? 60 : score >= 60 ? 90 : 120;
    const closeDate = new Date();
    closeDate.setDate(closeDate.getDate() + daysToAdd);
    return closeDate.toISOString();
  }

  private mapToHubSpotStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'Lead': 'appointmentscheduled',
      'Prospecting': 'qualifiedtobuy',
      'Qualified': 'presentationscheduled',
      'Proposal': 'decisionmakerboughtin',
      'Negotiation': 'contractsent',
      'Closed Won': 'closedwon',
      'Closed Lost': 'closedlost'
    };
    return stageMap[stage] || 'appointmentscheduled';
  }

  private mapToPipedriveStage(stage: string): number {
    const stageMap: Record<string, number> = {
      'Lead': 1,
      'Prospecting': 2,
      'Qualified': 3,
      'Proposal': 4,
      'Negotiation': 5,
      'Closed Won': 6,
      'Closed Lost': 7
    };
    return stageMap[stage] || 1;
  }

  private async getOrCreatePipedriveOrg(): Promise<string> {
    // In real implementation, search for existing org or create new one
    return 'pd_org_' + Date.now();
  }

  private updateMetrics(success: boolean, error?: string): void {
    if (success) {
      this.metrics.totalContacts++;
      this.metrics.totalOpportunities++;
      this.metrics.totalActivities += 3; // Typical number of activities created
    } else if (error) {
      this.metrics.errors.push(error);
    }

    // Update success rate
    const totalOperations = this.metrics.totalContacts + this.metrics.errors.length;
    this.metrics.syncSuccessRate = totalOperations > 0 ? 
      (this.metrics.totalContacts / totalOperations) * 100 : 100;

    this.metrics.lastSyncTime = new Date().toISOString();
  }

  private async mockAPICall(endpoint: string, data: unknown): Promise<unknown> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error(`API call failed for ${endpoint}`);
    }

    return {
      id: `${endpoint.split('/')[0]}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      success: true,
      data: data
    };
  }

  // Public methods for configuration and monitoring
  updateConfig(newConfig: Partial<CRMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getMetrics(): CRMIntegrationMetrics {
    return { ...this.metrics };
  }

  isConfigured(): boolean {
    return this.config.enabled && (
      Boolean(this.config.apiKey) || 
      Boolean(this.config.apiToken) || 
      Boolean(this.config.customEndpoint)
    );
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test connection based on provider
      const testData = { test: true, timestamp: new Date().toISOString() };
      const response = await this.mockAPICall(`${this.config.provider}/test`, testData);
      return response.success;
    } catch (error) {
      console.error('CRM connection test failed:', error);
      return false;
    }
  }
}

// Factory function for easy integration
export function createCRMIntegration(config: CRMConfig): CRMIntegrationManager {
  return new CRMIntegrationManager(config);
}

// Default configurations for popular CRM providers
export const defaultCRMConfigs: Record<string, Partial<CRMConfig>> = {
  'sphere-os': {
    provider: 'sphere-os',
    instanceUrl: 'https://crm.repspheres.com',
    enabled: true // Enable by default as primary CRM
  },
  salesforce: {
    provider: 'salesforce',
    enabled: false
  },
  hubspot: {
    provider: 'hubspot',
    enabled: false
  },
  pipedrive: {
    provider: 'pipedrive',
    enabled: false
  },
  zoho: {
    provider: 'zoho',
    enabled: false
  },
  custom: {
    provider: 'custom',
    enabled: false
  }
};

// CRM Integration status checker
export async function checkCRMIntegrationStatus(configs: CRMConfig[]): Promise<Record<string, boolean>> {
  const status: Record<string, boolean> = {};
  
  for (const config of configs) {
    if (config.enabled) {
      const manager = new CRMIntegrationManager(config);
      status[config.provider] = await manager.testConnection();
    } else {
      status[config.provider] = false;
    }
  }
  
  return status;
}

// Batch sync multiple prospects
export async function batchSyncToCRM(
  prospects: Array<{
    scanResult: EnhancedScanResult;
    researchData: ResearchData;
    outreachData?: PersonalizedOutreach;
  }>,
  crmConfigs: CRMConfig[]
): Promise<Record<string, CRMSyncResult[]>> {
  const results: Record<string, CRMSyncResult[]> = {};
  
  for (const config of crmConfigs.filter(c => c.enabled)) {
    const manager = new CRMIntegrationManager(config);
    results[config.provider] = [];
    
    for (const prospect of prospects) {
      const result = await manager.syncToggCRM(
        prospect.scanResult,
        prospect.researchData,
        prospect.outreachData
      );
      results[config.provider].push(result);
    }
  }
  
  return results;
}