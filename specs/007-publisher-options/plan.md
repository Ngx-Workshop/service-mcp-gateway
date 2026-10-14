# Implementation plan
Spec: [spec.md](spec.md)

Use stateless publisher HTTP mappings, shared store and scoped VM. Keep form/draft state scoped; serialize commands through the existing busy guard. Initialization runs ordered reads so commands cannot overlap. Add gateway model catalog, optional model input, subject-filtered receipt list and image generation followed by owner upload. Regenerate contracts and vendor the new package before consuming types. Presentation options are extracted to an OnPush component with typed inputs/outputs. Existing review component remains a documented cohesive size exception. Maintain auth boundary and public catalog tools unchanged.

Verify gateway unit tests/build/contract build/lint, Angular architecture/tests/strict types/production build. Paid OpenAI and live shell integration require deployed services; do not claim these from doubles. Pricing reference: https://developers.openai.com/api/docs/pricing, https://developers.openai.com/api/docs/models/gpt-6.1-sol and gpt-6-luna; image API: https://developers.openai.com/api/docs/guides/image-generation (checked 2026-10-13).
