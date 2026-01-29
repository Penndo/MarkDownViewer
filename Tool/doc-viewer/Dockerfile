# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy the entire dist folder content
# We assume this Dockerfile is built from the 'dist' directory context
# Structure in dist:
# - doc-viewer/ (Next.js standalone app)
# - IDD/        (Documentation)
COPY . .

# Expose the port
EXPOSE 3000

# Set the working directory to where the Next.js server.js is
WORKDIR /app/doc-viewer

# Start the application
CMD ["node", "server.js"]
