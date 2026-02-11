# Latest Update: Dual Engine Image Optimization (v3.2.1)

Based on user feedback, we have enhanced the "Dual Engine Smart Refinement" system prompt to improve stability and recognition for legal document images.

## Changelog
- **Optimized LLM Prompt**: The model now explicitly scans for context clues around images to identify:
    - **Signatures & Seals**: Recognized via keywords like "签字", "盖章", "Signed by". Outputs: `![Signature/Seal]`
    - **Identity Documents**: Recognized via keywords like "身份证", "ID Card". Outputs: `![ID Card]`
    - **Business Licenses**: Recognized via keywords like "营业执照". Outputs: `![Business License]`
- **Worker Deployed**: The `legal-ocr-worker` has been redeployed with these changes.

## Verification
Upload a document containing signatures or seals and check if the Markdown output now includes `![Signature/Seal]` instead of generic `![img-123]`.
