# Multi-stage build for full-stack ecommerce app

# Stage 1: Build Java backend
FROM maven:3.9-eclipse-temurin-17 AS backend-builder

WORKDIR /app

COPY backend/pom.xml ./pom.xml
RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Build React frontend
FROM node:20 AS frontend-builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 3: Runtime - Java backend with static frontend
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the built Java application
COPY --from=backend-builder /app/target/*.jar app.jar

# Copy the built React app to serve as static files
# Assuming your Spring Boot app serves static files from src/main/resources/static
COPY --from=frontend-builder /app/build ./static

EXPOSE 8080

# Force the port via JVM argument
CMD ["sh", "-c", "java -Xmx400m -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar app.jar"]
