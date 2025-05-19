/**
 * Mock n8n Responses
 * Sample responses for testing
 */

export const mockResearchSuccessResponse = {
    success: true,
    result: {
      processType: 'loan origination',
      industry: 'financial services',
      processStructure: {
        milestones: [
          {
            name: 'Application Intake',
            description: 'Collecting initial borrower information',
            order: 100,
            confidence: 0.9,
            source: 'consumerfinance.gov'
          },
          {
            name: 'Document Collection',
            description: 'Gathering required financial documents',
            order: 200,
            confidence: 0.9,
            source: 'fanniemae.com'
          },
          {
            name: 'Initial Underwriting',
            description: 'Preliminary creditworthiness assessment',
            order: 300,
            confidence: 0.8,
            source: 'mba.org'
          }
        ],
        steps: [
          {
            name: 'Borrower Information Collection',
            milestone: 'Application Intake',
            description: 'Capturing borrower personal and contact details',
            order: 100,
            confidence: 0.9,
            source: 'fanniemae.com'
          },
          {
            name: 'Property Information',
            milestone: 'Application Intake',
            description: 'Gathering information about the property',
            order: 200,
            confidence: 0.9,
            source: 'fanniemae.com'
          }
        ]
      },
      dataRequirements: {
        requiredFields: [
          {
            name: 'borrower_name',
            label: 'Borrower Full Name',
            fieldType: 'string',
            required: true,
            confidence: 0.9,
            source: 'fanniemae.com'
          },
          {
            name: 'borrower_address',
            label: 'Borrower Current Address',
            fieldType: 'string',
            required: true,
            confidence: 0.9,
            source: 'fanniemae.com'
          }
        ]
      },
      complianceRequirements: {
        regulations: [
          {
            name: 'TILA-RESPA Integrated Disclosure',
            abbreviation: 'TRID',
            description: 'Federal regulation requiring specific disclosures',
            confidence: 0.9,
            source: 'consumerfinance.gov'
          }
        ]
      },
      sources: [
        {
          url: 'https://www.consumerfinance.gov/compliance/compliance-resources/mortgage-resources/tila-respa-integrated-disclosures/',
          title: 'TILA-RESPA Integrated Disclosure rule implementation',
          authorityScore: 18,
          contentRelevance: 0.9
        },
        {
          url: 'https://www.fanniemae.com/originating-underwriting/mortgage-products/loan-origination-process',
          title: 'Loan Origination Process Guide',
          authorityScore: 16,
          contentRelevance: 0.9
        }
      ],
      confidence: {
        overall: 0.85,
        processStructure: 0.9,
        dataRequirements: 0.8,
        complianceRequirements: 0.85
      }
    }
  };
  
  export const mockResearchErrorResponse = {
    success: false,
    error: 'Failed to complete research operation',
    details: 'Search API returned an error: Rate limit exceeded'
  };
  
  export const mockImplementSuccessResponse = {
    success: true,
    result: {
      processId: '6a7b8c9d0e1f2g3h4i5j',
      processName: 'Loan Origination Process',
      milestones: [
        {
          id: '1a2b3c4d5e6f7g8h9i0j',
          name: 'Application Intake',
          status: 'created'
        },
        {
          id: '2b3c4d5e6f7g8h9i0j1a',
          name: 'Document Collection',
          status: 'created'
        }
      ],
      stepCount: 12,
      questionCount: 48,
      ruleCount: 5,
      status: 'completed',
      timestamp: '2025-05-19T15:30:45.123Z'
    }
  };
  
  export const mockImplementErrorResponse = {
    success: false,
    error: 'Failed to implement process',
    details: 'ServiceNow API authentication failed'
  };