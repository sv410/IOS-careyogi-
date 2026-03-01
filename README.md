# CareYogi Health Integration

CareYogi Health Integration is a Proof of Concept (PoC) demonstrating how to pull Apple Health (HealthKit) data into a web dashboard.

## Architecture & Why Direct Access is Impossible

**Important:** Apple explicitly prevents any direct access to HealthKit from web browsers due to strict privacy and security policies. HealthKit data is securely encrypted on the user's device. 

To bridge this gap, the correct architecture requires a native iOS application to act as a bridge:

1. **Apple Health (HealthKit)**: Securely stores health data on the iOS device.
2. **iOS Bridge App**: A native iOS application built with Swift. This app requests permission to read HealthKit data and securely transmits it to our backend.
3. **Secure API (Node.js/Express Backend)**: A secure endpoint (`POST /api/health-data`) that requires authentication to receive the data from the iOS app.
4. **Web Dashboard (React Frontend)**: A responsive, auto-refreshing dashboard that fetches data from the backend (`GET /api/dashboard-data`) and visualizes it.

**Data Flow:**
`HealthKit (iPhone) -> iOS Bridge App -> Node.js Backend API -> React Web Dashboard`

---

## iOS Bridge App: Swift Code Snippet

Below is a simplified Swift code snippet that your iOS Bridge App needs to implement. It requests HealthKit permission, reads the step count, and sends a JSON payload to the Secure API.

```swift
import HealthKit
import Foundation

// This is the bridge between Apple Health and the web dashboard.
class HealthBridgeManager {
    let healthStore = HKHealthStore()
    
    // Replace with your actual deployed backend URL or local IP
    let backendUrl = URL(string: "https://your-domain.com/api/health-data")!
    let apiKey = "default_careyogi_secret_key" // Must match backend expected key
    
    func requestAuthorization(completion: @escaping (Bool) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(false)
            return
        }
        
        // Define the data types we want to read
        let stepCount = HKObjectType.quantityType(forIdentifier: .stepCount)!
        let heartRate = HKObjectType.quantityType(forIdentifier: .heartRate)!
        let activeEnergy = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
        let sleepAnalysis = HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
        
        let typesToRead: Set = [stepCount, heartRate, activeEnergy, sleepAnalysis]
        
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { (success, error) in
            completion(success)
        }
    }
    
    // Example: Fetch today's step count and send to backend
    func fetchAndSendSteps() {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else { return }
        
        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)
        
        let query = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
            guard let result = result, let sum = result.sumQuantity() else {
                return
            }
            
            let steps = sum.doubleValue(for: HKUnit.count())
            
            // Note: In a full app, you'd fetch all metrics (HR, calories, sleep)
            // and combine them into this single payload.
            let healthData: [String: Any] = [
                "steps": steps,
                "heartRate": 72,       // Placeholder: fetch actual value
                "calories": 2100,      // Placeholder: fetch actual value
                "sleepHours": 7.5,     // Placeholder: fetch actual value
                "timestamp": ISO8601DateFormatter().string(from: Date())
            ]
            
            self.sendDataToBackend(payload: healthData)
        }
        
        healthStore.execute(query)
    }
    
    private func sendDataToBackend(payload: [String: Any]) {
        var request = URLRequest(url: backendUrl)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        
        do {
            request.httpBody = try JSONSerialization.data(withJSONObject: payload, options: [])
            
            let task = URLSession.shared.dataTask(with: request) { data, response, error in
                if let error = error {
                    print("Error sending health data: \(error.localizedDescription)")
                    return
                }
                print("Successfully sent health data to dashboard API")
            }
            task.resume()
        } catch {
            print("Failed to serialize JSON")
        }
    }
}
```

---

## Instructions to Run Locally

1. **Install dependencies:** `npm install` (If not already installed)
2. **Start the server:** `npm run dev`
3. **View Dashboard:** Open the provided Replit webview or navigate to `http://localhost:5000` (depending on environment).
4. **Test the API manually:** 
   You can mock data sending from iOS using a curl command:
   ```bash
   curl -X POST http://localhost:5000/api/health-data \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer default_careyogi_secret_key" \
        -d '{"steps": 8500, "heartRate": 75, "calories": 2300, "sleepHours": 8.0}'
   ```
