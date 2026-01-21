#!/bin/bash
# Quick Dashboard Verification Script

echo "🔍 Dashboard Implementation Verification"
echo "=========================================="
echo ""

# Verifica arquivo do backend
echo "📁 Verificando arquivos do backend..."
files=(
  "apps/backend/src/app/modules/dashboard/domain/entities/dashboard-statistics.entity.ts"
  "apps/backend/src/app/modules/dashboard/domain/ports/dashboard.repository.port.ts"
  "apps/backend/src/app/modules/dashboard/infra/repositories/dashboard.repository.ts"
  "apps/backend/src/app/modules/dashboard/adapters/dtos/dashboard-stats.response.dto.ts"
  "apps/backend/src/app/modules/dashboard/adapters/dtos/recent-user.response.dto.ts"
  "apps/backend/src/app/modules/dashboard/presentation/use-cases/get-dashboard-stats.ucase.ts"
  "apps/backend/src/app/modules/dashboard/presentation/use-cases/get-recent-users.ucase.ts"
  "apps/backend/src/app/modules/dashboard/adapters/controllers/dashboard.controller.ts"
  "apps/backend/src/app/modules/dashboard/dashboard.module.ts"
)

backend_ok=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
    ((backend_ok++))
  else
    echo "  ❌ $file"
  fi
done

echo ""
echo "📁 Verificando arquivos do frontend..."
frontend_files=(
  "apps/frontend/src/domain/dashboard/dashboard.types.ts"
  "apps/frontend/src/infra/services/dashboard.service.ts"
  "apps/frontend/src/presentation/pages/dashboard-page.tsx"
  "apps/frontend/src/adapters/components/dashboard/stat-card.tsx"
  "apps/frontend/src/adapters/components/dashboard/recent-users-table.tsx"
)

frontend_ok=0
for file in "${frontend_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
    ((frontend_ok++))
  else
    echo "  ❌ $file"
  fi
done

echo ""
echo "🏗️  Compilando backend..."
npx nx build backend 2>&1 | grep -E "(successfully|error|ERROR)" || echo "Build concluído"

echo ""
echo "🏗️  Compilando frontend..."
npx nx build frontend 2>&1 | grep -E "(successfully|error|ERROR)" || echo "Build concluído"

echo ""
echo "=========================================="
echo "✅ Verificação concluída!"
echo ""
echo "Arquivos backend: $backend_ok/9"
echo "Arquivos frontend: $frontend_ok/5"
echo ""
echo "📊 Próximos passos:"
echo "  1. npm run start:backend"
echo "  2. npm run start:frontend"
echo "  3. docker-compose up -d"
echo "  4. Acesse http://localhost:5173/dashboard"
echo "  5. Jaeger: http://localhost:16686"
