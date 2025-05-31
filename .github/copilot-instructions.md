<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# System Health Monitor - Copilot Instructions

This is an Electron desktop application for Windows system monitoring and optimization.

## Project Structure
- Built with Electron, React, and TypeScript
- Uses systeminformation library for system data
- Modern UI with glassmorphism design
- Real-time monitoring capabilities
- System optimization tools

## Development Guidelines
- Follow TypeScript best practices
- Use React hooks for state management
- Implement proper error handling for system operations
- Maintain consistent UI/UX patterns
- Focus on Windows-specific optimizations

## Key Components
- Main process handles system information gathering
- Renderer process displays UI with real-time updates
- IPC communication between main and renderer
- PowerShell integration for Windows operations

## Security Considerations
- Use contextIsolation and disable nodeIntegration
- Validate all system operations
- Implement proper error boundaries
- Sanitize user inputs
