/**
 * Jest configuration
 */
export default {
    // Indicates whether each individual test should be reported during the run
    verbose: true,
    
    // The test environment that will be used for testing
    testEnvironment: "node",
    
    // The glob patterns Jest uses to detect test files
    testMatch: [
      "**/tests/**/*.test.js"
    ],
    
    // An array of regexp pattern strings that are matched against all test paths
    // before executing the test
    testPathIgnorePatterns: [
      "/node_modules/"
    ],
    
    // Automatically clear mock calls and instances between every test
    clearMocks: true,
    
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: false,
    
    // The directory where Jest should output its coverage files
    coverageDirectory: "coverage",
    
    // An array of regexp pattern strings used to skip coverage collection
    coveragePathIgnorePatterns: [
      "/node_modules/",
      "/tests/"
    ],
    
    // Configure the format of Jest's output
    transform: {},
    
    // Allow ES6 import/export syntax
    type: "module"
  };