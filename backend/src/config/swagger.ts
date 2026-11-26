
export const swaggerSpec = {
  openapi: "3.0.3",

  info: {
    title: "Nepal Bike Rental API",
    version: "1.0.0",
    description:
      "API documentation for the Nepal Bike Rental application.",
  },

  servers: [
    {
      url: "http://localhost:4000",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Health",
      description: "Backend health checks",
    },
    {
      name: "Authentication",
      description: "Admin authentication and account verification",
    },
    {
      name: "Vehicles",
      description: "Vehicle listing and fleet management",
    },
    {
      name: "Bookings",
      description: "Guest booking requests and admin booking management",
    },
    {
      name: "Availability",
      description: "Vehicle availability and blocked rental dates",
    },
  ],

  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT access token.",
      },
    },

    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            example: "admin@example.com",
          },
          password: {
            type: "string",
            example: "YourStrongPassword",
          },
        },
      },

      Vehicle: {
        type: "object",
        required: [
          "slug",
          "name",
          "brand",
          "modelYear",
          "category",
          "tagline",
          "description",
          "keySpecs",
          "specs",
          "images",
          "rentalTypes",
          "offRoadEligible",
          "destinations",
          "featured",
          "isSample",
        ],
        properties: {
          slug: {
            type: "string",
            example: "honda-xr-190",
          },
          name: {
            type: "string",
            example: "Honda XR 190",
          },
          brand: {
            type: "string",
            nullable: true,
            example: "Honda",
          },
          modelYear: {
            type: "integer",
            nullable: true,
            example: 2024,
          },
          category: {
            type: "string",
            enum: ["scooty", "motorcycle", "car", "jeep"],
            example: "motorcycle",
          },
          tagline: {
            type: "string",
            example: "Explore Nepal with confidence",
          },
          description: {
            type: "string",
            example:
              "A reliable motorcycle for city and adventure rides.",
          },
          keySpecs: {
            type: "array",
            items: { type: "string" },
            example: ["190cc", "Manual", "Petrol"],
          },
          specs: {
            type: "array",
            items: {
              type: "object",
              required: ["label", "value"],
              properties: {
                label: { type: "string", example: "Engine" },
                value: { type: "string", example: "190cc" },
              },
            },
          },
          images: {
            type: "array",
            items: {
              type: "object",
              required: ["src", "alt"],
              properties: {
                src: {
                  type: "string",
                  example: "https://example.com/bike.jpg",
                },
                alt: {
                  type: "string",
                  example: "Honda XR 190 motorcycle",
                },
              },
            },
          },
          rentalTypes: {
            type: "array",
            items: { type: "string" },
            example: ["city", "adventure"],
          },
          offRoadEligible: {
            type: "boolean",
            example: true,
          },
          dailyRateOverride: {
            type: "number",
            nullable: true,
            example: 1500,
          },
          destinations: {
            type: "array",
            items: { type: "string" },
            example: ["pokhara", "mustang"],
          },
          featured: {
            type: "boolean",
            example: true,
          },
          badge: {
            type: "string",
            example: "Most Popular",
          },
          bookedRanges: {
            type: "array",
            items: {
              type: "object",
              required: ["start", "end"],
              properties: {
                start: {
                  type: "string",
                  format: "date",
                  example: "2026-12-01",
                },
                end: {
                  type: "string",
                  format: "date",
                  example: "2026-12-03",
                },
              },
            },
          },
          isSample: {
            type: "boolean",
            example: false,
          },
        },
      },

      VehicleUpdate: {
        type: "object",
        description: "All fields are optional. The slug cannot be changed.",
        properties: {
          name: { type: "string" },
          brand: { type: "string", nullable: true },
          modelYear: { type: "integer", nullable: true },
          category: {
            type: "string",
            enum: ["scooty", "motorcycle", "car", "jeep"],
          },
          tagline: { type: "string" },
          description: { type: "string" },
          keySpecs: {
            type: "array",
            items: { type: "string" },
          },
          specs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                value: { type: "string" },
              },
            },
          },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                src: { type: "string" },
                alt: { type: "string" },
              },
            },
          },
          rentalTypes: {
            type: "array",
            items: { type: "string" },
          },
          offRoadEligible: { type: "boolean" },
          dailyRateOverride: {
            type: "number",
            nullable: true,
          },
          destinations: {
            type: "array",
            items: { type: "string" },
          },
          featured: { type: "boolean" },
          badge: { type: "string" },
          bookedRanges: {
            type: "array",
            items: {
              type: "object",
              properties: {
                start: { type: "string", format: "date" },
                end: { type: "string", format: "date" },
              },
            },
          },
          isSample: { type: "boolean" },
        },
      },

      // BOOKING SCHEMAS

      CreateBookingRequest: {
        type: "object",
        required: [
          "name",
          "phone",
          "vehicleSlug",
          "startDate",
          "returnDate",
          "tripType",
          "destination",
          "days",
          "estimateStatus",
          "estimateTotal",
        ],
        properties: {
          reference: {
            type: "string",
            example: "NBR-A1B2C3D4",
            description: "Optional booking reference.",
          },
          source: {
            type: "string",
            enum: ["website", "whatsapp"],
            default: "website",
            example: "website",
          },
          pickupTime: {
            type: "string",
            example: "09:00 AM",
          },
          name: {
            type: "string",
            example: "Test Customer",
          },
          phone: {
            type: "string",
            example: "9800000000",
          },
          email: {
            type: "string",
            example: "",
          },
          vehicleSlug: {
            type: "string",
            example: "honda-dio-scooty",
          },
          startDate: {
            type: "string",
            format: "date",
            example: "2026-12-01",
          },
          returnDate: {
            type: "string",
            format: "date",
            example: "2026-12-02",
          },
          tripType: {
            type: "string",
            enum: ["city", "adventure"],
            example: "city",
          },
          destination: {
            type: "string",
            example: "Pokhara",
          },
          message: {
            type: "string",
            example: "Testing guest booking",
          },
          days: {
            type: "integer",
            minimum: 1,
            example: 2,
          },
          estimateStatus: {
            type: "string",
            enum: ["estimate", "quote", "incomplete"],
            example: "estimate",
          },
          estimateTotal: {
            type: "number",
            minimum: 0,
            example: 3000,
          },
        },
      },

      UpdateBookingStatus: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["new", "confirmed", "declined", "completed"],
            example: "confirmed",
          },
        },
      },

      BookingCreatedResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "Booking request submitted successfully",
          },
          data: {
            type: "object",
            properties: {
              reference: {
                type: "string",
                example: "NBR-A1B2C3D4",
              },
              status: {
                type: "string",
                example: "awaiting_confirmation",
              },
            },
          },
        },
      },

      BookedRange: {
        type: "object",
        required: ["start", "end"],
        properties: {
          start: {
            type: "string",
            format: "date",
            example: "2026-12-01",
          },
          end: {
            type: "string",
            format: "date",
            example: "2026-12-02",
          },
        },
      },
    },
  },

  paths: {
    // HEALTH

    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check backend status",
        responses: {
          "200": {
            description: "Backend is running",
          },
        },
      },
    },

    // AUTHENTICATION

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description:
              "Login successful. Returns admin details and JWT access token.",
          },
          "400": {
            description: "Invalid request data",
          },
          "401": {
            description: "Invalid email or password",
          },
        },
      },
    },

    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get authenticated admin",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated admin details",
          },
          "401": {
            description: "Missing, invalid, or expired token",
          },
        },
      },
    },

    // VEHICLES

    "/api/vehicles": {
      get: {
        tags: ["Vehicles"],
        summary: "Get all vehicles",
        description: "Public endpoint to retrieve all vehicles.",
        responses: {
          "200": {
            description: "Vehicle list retrieved successfully",
          },
          "500": {
            description: "Unable to fetch vehicles",
          },
        },
      },

      post: {
        tags: ["Vehicles"],
        summary: "Create a vehicle",
        description: "Admin-only endpoint to add a new vehicle.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Vehicle",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Vehicle created successfully",
          },
          "400": {
            description: "Invalid vehicle details",
          },
          "401": {
            description: "Authentication required",
          },
          "409": {
            description: "Vehicle slug already exists",
          },
        },
      },
    },

    "/api/vehicles/{slug}": {
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          example: "honda-xr-190",
        },
      ],

      get: {
        tags: ["Vehicles"],
        summary: "Get vehicle by slug",
        description: "Public endpoint to retrieve one vehicle.",
        responses: {
          "200": {
            description: "Vehicle retrieved successfully",
          },
          "404": {
            description: "Vehicle not found",
          },
        },
      },

      patch: {
        tags: ["Vehicles"],
        summary: "Update a vehicle",
        description: "Admin-only endpoint to update vehicle details.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/VehicleUpdate",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Vehicle updated successfully",
          },
          "400": {
            description: "Invalid vehicle details",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "Vehicle not found",
          },
        },
      },

      delete: {
        tags: ["Vehicles"],
        summary: "Delete a vehicle",
        description: "Admin-only endpoint to delete a vehicle.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Vehicle deleted successfully",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "Vehicle not found",
          },
          "500": {
            description: "Vehicle could not be deleted",
          },
        },
      },
    },

    // BOOKINGS

    "/api/booking-requests": {
      post: {
        tags: ["Bookings"],
        summary: "Submit a guest booking request",
        description:
          "Public endpoint. Customers can submit a booking without creating an account. The booking starts with status new and awaits admin confirmation.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateBookingRequest",
              },
              example: {
                name: "Test Customer",
                phone: "9800000000",
                email: "",
                vehicleSlug: "honda-dio-scooty",
                startDate: "2026-12-01",
                returnDate: "2026-12-02",
                tripType: "city",
                destination: "Pokhara",
                message: "Testing guest booking",
                days: 2,
                estimateStatus: "estimate",
                estimateTotal: 3000,
                source: "website",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Booking request submitted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BookingCreatedResponse",
                },
              },
            },
          },
          "400": {
            description: "Invalid booking details or dates",
          },
          "404": {
            description: "Selected vehicle not found",
          },
          "500": {
            description: "Unable to create booking request",
          },
        },
      },

      get: {
        tags: ["Bookings"],
        summary: "Get all booking requests",
        description:
          "Admin-only endpoint. Returns booking requests, associated vehicle information, and payment records.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Booking requests retrieved successfully",
          },
          "401": {
            description: "Authentication required",
          },
          "500": {
            description: "Unable to retrieve booking requests",
          },
        },
      },
    },

    "/api/booking-requests/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Booking database ID",
          schema: {
            type: "string",
          },
          example: "cm123456789",
        },
      ],

      patch: {
        tags: ["Bookings"],
        summary: "Update booking status",
        description:
          "Admin-only endpoint. Change a booking to new, confirmed, declined, or completed. Confirming a booking checks for overlapping confirmed bookings for the same vehicle.",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateBookingStatus",
              },
              example: {
                status: "confirmed",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Booking status updated successfully",
          },
          "400": {
            description: "Invalid booking status",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "Booking not found",
          },
          "409": {
            description:
              "Vehicle already has a confirmed booking during these dates",
          },
          "500": {
            description: "Unable to update booking status",
          },
        },
      },

      delete: {
        tags: ["Bookings"],
        summary: "Delete a booking",
        description:
          "Admin-only endpoint. Permanently deletes a booking and its associated payment records.",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Booking deleted successfully",
          },
          "401": {
            description: "Authentication required",
          },
          "404": {
            description: "Booking not found",
          },
          "500": {
            description: "Unable to delete booking",
          },
        },
      },
    },

    // AVAILABILITY

    "/api/availability": {
      get: {
        tags: ["Availability"],
        summary: "Get vehicle blocked dates",
        description:
          "Public endpoint. Returns blocked date ranges grouped by vehicle slug. Includes manually blocked dates and bookings with confirmed status. New, declined, and completed bookings do not block dates.",
        responses: {
          "200": {
            description: "Vehicle availability retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: {
                      type: "boolean",
                      example: true,
                    },
                    data: {
                      type: "object",
                      additionalProperties: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/BookedRange",
                        },
                      },
                      example: {
                        "honda-dio-scooty": [
                          {
                            start: "2026-12-01",
                            end: "2026-12-02",
                          },
                        ],
                        "ktm-duke-200": [],
                      },
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Unable to retrieve vehicle availability",
          },
        },
      },
    },
  },
};
