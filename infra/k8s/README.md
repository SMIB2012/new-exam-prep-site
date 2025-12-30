# Kubernetes Manifests

This directory will contain Kubernetes deployment manifests for production and staging environments.

## Structure (Planned)

- `base/` - Base Kustomize configurations
- `overlays/` - Environment-specific overlays (dev, staging, prod)
- `secrets/` - Secret templates (use sealed-secrets or external-secrets)
- `monitoring/` - Prometheus, Grafana configurations
- `ingress/` - Ingress controllers and routing

## Status

🚧 **Placeholder** - Kubernetes manifests will be added as the project moves toward container orchestration.

## Notes

- Use Kustomize for environment-specific configurations
- Secrets should be managed via external-secrets-operator or sealed-secrets
- All sensitive values must be externalized to secrets/configmaps
- Consider using Helm charts for complex deployments

