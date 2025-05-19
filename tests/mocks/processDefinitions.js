/**
 * Process Definition Mocks
 * Sample process definitions for testing
 */

export const sampleLoanOriginationProcess = {
    process: {
      name: 'Loan Origination Process',
      description: 'Process for originating mortgage loans following TRID requirements',
      table: 'incident'
    },
    milestones: [
      {
        name: 'Application Intake',
        short_description: 'Collecting initial borrower information',
        glyph: 'user',
        order: 100,
        steps: [
          {
            name: 'Borrower Information',
            short_label: 'Borrower Info',
            step_type: 'form',
            display_label: 'Borrower Information Collection',
            short_description: 'Collect basic borrower details',
            footer_message: 'All fields are required for compliance',
            glyph: 'user',
            show_on_sidebar: true,
            show_on_confirmation: true,
            order: 100,
            one_time_step: false,
            questions: [
              {
                name: 'borrower_name',
                label: 'Borrower Full Name',
                type: 'string',
                order: 100,
                mandatory: true,
                help_text: 'Enter legal full name as it appears on identification documents'
              },
              {
                name: 'borrower_address',
                label: 'Current Address',
                type: 'string',
                order: 200,
                mandatory: true,
                help_text: 'Enter current residential address'
              },
              {
                name: 'borrower_ssn',
                label: 'Social Security Number',
                type: 'string',
                order: 300,
                mandatory: true,
                help_text: 'Format: XXX-XX-XXXX'
              }
            ]
          },
          {
            name: 'Property Information',
            short_label: 'Property Info',
            step_type: 'form',
            display_label: 'Property Information',
            short_description: 'Collect information about the property being purchased',
            glyph: 'home',
            show_on_sidebar: true,
            show_on_confirmation: true,
            order: 200,
            one_time_step: false,
            questions: [
              {
                name: 'property_address',
                label: 'Property Address',
                type: 'string',
                order: 100,
                mandatory: true
              },
              {
                name: 'property_type',
                label: 'Property Type',
                type: 'choice',
                order: 200,
                mandatory: true
              },
              {
                name: 'purchase_price',
                label: 'Purchase Price',
                type: 'decimal',
                order: 300,
                mandatory: true
              }
            ]
          }
        ]
      },
      {
        name: 'Document Collection',
        short_description: 'Gathering required financial documents',
        glyph: 'file',
        order: 200,
        steps: [
          {
            name: 'Income Verification',
            short_label: 'Income Docs',
            step_type: 'form',
            display_label: 'Income Verification Documents',
            short_description: 'Upload documents to verify income',
            glyph: 'money',
            show_on_sidebar: true,
            show_on_confirmation: true,
            order: 100,
            one_time_step: false,
            questions: [
              {
                name: 'employment_status',
                label: 'Employment Status',
                type: 'choice',
                order: 100,
                mandatory: true
              },
              {
                name: 'annual_income',
                label: 'Annual Income',
                type: 'decimal',
                order: 200,
                mandatory: true
              }
            ]
          }
        ]
      }
    ],
    rules: [
      {
        name: 'Purchase Price Validation',
        type: 'step',
        script: 'if (inputs.purchase_price <= 0) { return false; } return true;',
        message_simple: 'Purchase price must be greater than zero'
      },
      {
        name: 'Income Validation',
        type: 'step',
        script: 'if (inputs.annual_income <= 0) { return false; } return true;',
        message_simple: 'Annual income must be greater than zero'
      }
    ]
  };
  
  export const sampleEmployeeOnboardingProcess = {
    process: {
      name: 'Employee Onboarding Process',
      description: 'Process for onboarding new employees',
      table: 'incident'
    },
    milestones: [
      {
        name: 'HR Information Collection',
        short_description: 'Collecting employee personal information',
        glyph: 'user',
        order: 100,
        steps: [
          {
            name: 'Personal Information',
            short_label: 'Personal Info',
            step_type: 'form',
            display_label: 'Employee Personal Information',
            short_description: 'Collect basic employee details',
            glyph: 'user',
            show_on_sidebar: true,
            show_on_confirmation: true,
            order: 100,
            one_time_step: false,
            questions: [
              {
                name: 'employee_name',
                label: 'Full Name',
                type: 'string',
                order: 100,
                mandatory: true
              },
              {
                name: 'employee_id',
                label: 'Employee ID',
                type: 'string',
                order: 200,
                mandatory: true
              }
            ]
          }
        ]
      },
      {
        name: 'IT Setup',
        short_description: 'Setting up IT resources',
        glyph: 'laptop',
        order: 200,
        steps: [
          {
            name: 'Equipment Selection',
            short_label: 'Equipment',
            step_type: 'form',
            display_label: 'IT Equipment Selection',
            short_description: 'Select required IT equipment',
            glyph: 'desktop',
            show_on_sidebar: true,
            show_on_confirmation: true,
            order: 100,
            one_time_step: false,
            questions: [
              {
                name: 'laptop_type',
                label: 'Laptop Type',
                type: 'choice',
                order: 100,
                mandatory: true
              },
              {
                name: 'monitor_count',
                label: 'Number of Monitors',
                type: 'integer',
                order: 200,
                mandatory: true
              }
            ]
          }
        ]
      }
    ]
  };