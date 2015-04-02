struct meta {
  1: optional bool shouldIgnore
  2: optional double pickupLatitude
  3: optional double pickupLongitude
  4: optional string tripId
  5: optional string clientToken
  6: optional i32 clientId
  7: optional double destinationLatitude
  8: optional double destinationLongitude
  9: optional string currentETA
  10: optional string fifoDispatchId
  11: optional double waitSince
  12: optional double driverLatitude
  13: optional double driverLongitude
}

struct driver {
  1: optional i32 id
  2: required double distance
  3: required double latitude
  4: required double longitude
  5: optional i32 vehicleCategoryId
  6: optional double updateTime
  7: optional i16 peerId
  8: required string status
  9: optional string token
  10: optional i32 vehicleId
  11: optional string vehicleUUID
  12: optional double course
  13: optional string uuid
  14: optional meta meta
}


struct FindResultPerVehicleView {
  1:bool cacheEmpty
  2:list<driver> cars
  3:i32 id
}

struct VehicleViewQuery {
  1:i32 id
  2:i32 maxNearestCars
  3:double maxDispatchDistanceMiles
  4:i32 maxNearestCabs
}

struct FindQuery {
  1:i32 mask
  2:string type
  3:list<VehicleViewQuery> vehicleViews
  4:double lat
  5:double lng
}

service NCar {
  map<string, FindResultPerVehicleView> find_as_thrift(1:FindQuery query)
}
