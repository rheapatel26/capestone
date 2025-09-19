// Simple backend connectivity test
import { ApiService } from './src/services/api';

export async function testBackendConnection() {
  try {
    console.log('🔄 Testing backend connection...');
    
    // Test creating a user
    const testUser = await ApiService.createUser('test_user_' + Date.now());
    console.log('✅ User created successfully:', testUser.username);
    
    // Test getting the user
    const fetchedUser = await ApiService.getUser(testUser.username);
    console.log('✅ User fetched successfully:', fetchedUser.username);
    
    // Test updating level data
    const levelData = {
      hints_used: 2,
      solution_used: false,
      incorrect: 3,
      correct_attempts: 1,
    };
    
    const updatedUser = await ApiService.updateLevelData(
      testUser.username,
      'Game1',
      'level1',
      levelData
    );
    console.log('✅ Level data updated successfully');
    
    // Test marking level complete
    const completion = await ApiService.markLevelComplete(
      testUser.username,
      'Game1',
      'level1'
    );
    console.log('✅ Level marked complete:', completion.message);
    
    console.log('🎉 All backend tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    return false;
  }
}

// Uncomment to run the test
// testBackendConnection();
