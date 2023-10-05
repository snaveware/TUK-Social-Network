# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app/backend

# Copy package.json and package-lock.json to the container
COPY backend/package*.json ./

ENV PORT=5000
ENV NODE_ENV=development
ENV INIT_DB=0
ENV SECRET=tuksocialnet
ENV ADMIN_PHONE=254759666898
ENV SERVER_EMAIL=work.evans020@gmail.com
ENV SERVER_EMAIL_PASSWORD=mzpnepafqojmnadg
ENV DATABASE_URL=postgresql://postgres:snave@localhost:5432/mydb?tuk-social-network
# Install backend project dependencies
RUN npm install

# Copy the rest of the backend files to the container
COPY backend/ .

# Expose the port that the backend app runs on
EXPOSE 8080

# Command to start the backend app
CMD ["npm", "start"]
