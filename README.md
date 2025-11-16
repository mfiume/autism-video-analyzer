# ARIA Autism Assessment Analyzer

A web-based tool for reviewing autism assessment videos alongside clinical and genomic data.

## Features

- **Video Playback**: YouTube video integration with playback controls
- **Clinical Data Display**: Subject, family, and sample information
- **Genomic Information**: DNA source, platform, and ancestry data
- **Clinical Scores**: ADOS, ADI-R, and Vineland scores
- **Speed Control**: Adjustable playback speed (0.25x - 2x)
- **Case Management**: Load and switch between different cases

## Default Case

Subject: **1-0102-004**
- DOB: August 1, 1992
- Sex: Male
- Affection: 2
- Family Type: SPX
- Ancestry: EUR
- Video: https://www.youtube.com/watch?v=US90ZQyKHR8

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open in browser:
   ```
   http://localhost:8082
   ```

## Interface

- **Left Panel**: Video player with playback controls
- **Right Panel**: Clinical and genomic data organized in sections
  - Subject Information
  - Family Information
  - Sample Information
  - Clinical Scores

## Controls

- **Load Case**: Opens sidebar to select different cases
- **Playback Speed**: Dropdown to adjust video speed
- **Video Player**: Standard YouTube controls (play, pause, seek, volume)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript, YouTube IFrame API
- **Backend**: Express.js, Node.js
- **Design**: Flat UI matching ARIA EEG and Protein viewers

## Clinical Scores

The app displays standardized autism assessment scores:
- **ADOS**: Autism Diagnostic Observation Schedule
- **ADI-R**: Autism Diagnostic Interview-Revised
- **Vineland**: Vineland Adaptive Behavior Scales
