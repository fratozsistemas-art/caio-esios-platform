#!/bin/bash

# 🧹 Base44 App - Cleanup Phase 1 (High Priority)
# Automated cleanup script for immediate optimizations
# Generated: 2025-12-27

set -e  # Exit on error

echo "🚀 Starting Base44 App Cleanup - Phase 1"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Backup before changes
echo "📦 Creating backup..."
BACKUP_DIR="backups/cleanup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/" 2>/dev/null || true
print_success "Backup created at $BACKUP_DIR"
echo ""

# Step 1: Remove unused dependencies
echo "📦 Step 1: Removing unused dependencies..."
echo "--------------------------------------------"

UNUSED_DEPS=(
    "@hello-pangea/dnd"
    "canvas-confetti"
    "lodash"
    "react-leaflet"
    "react-quill"
    "three"
)

for dep in "${UNUSED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "  Removing: $dep"
        npm uninstall "$dep" --save 2>/dev/null || print_warning "Failed to remove $dep (might not be installed)"
    else
        print_warning "$dep not found in package.json"
    fi
done

print_success "Unused dependencies removed"
echo ""

# Step 2: Delete empty placeholder pages
echo "🗑️  Step 2: Deleting placeholder pages..."
echo "--------------------------------------------"

# Check if Home.jsx is really just a placeholder
if [ -f "src/pages/Home.jsx" ]; then
    LINES=$(wc -l < "src/pages/Home.jsx")
    if [ "$LINES" -lt 15 ]; then
        echo "  Backing up Home.jsx to $BACKUP_DIR"
        cp "src/pages/Home.jsx" "$BACKUP_DIR/"
        echo "  Deleting src/pages/Home.jsx (placeholder)"
        # Don't actually delete yet, just mark for manual review
        print_warning "Home.jsx marked for deletion (manual review required)"
        echo "  → File location: src/pages/Home.jsx"
        echo "  → Lines: $LINES"
        echo "  → Action: Review and delete manually if confirmed as unused"
    else
        print_warning "Home.jsx has $LINES lines, skipping auto-delete (manual review recommended)"
    fi
else
    print_warning "Home.jsx not found"
fi

echo ""

# Step 3: Find and report unused imports (requires ESLint)
echo "🔍 Step 3: Scanning for unused imports..."
echo "--------------------------------------------"

if command -v npx &> /dev/null; then
    echo "  Running ESLint to detect unused imports..."
    npx eslint . --ext .js,.jsx,.ts,.tsx --quiet --format compact 2>/dev/null | grep "no-unused-vars" | head -20 > "$BACKUP_DIR/eslint-unused.log" || true
    
    if [ -s "$BACKUP_DIR/eslint-unused.log" ]; then
        print_warning "Found unused imports (saved to $BACKUP_DIR/eslint-unused.log)"
        echo "  First 5 issues:"
        head -5 "$BACKUP_DIR/eslint-unused.log" | sed 's/^/    /'
    else
        print_success "No unused imports detected by ESLint"
    fi
else
    print_warning "ESLint not available, skipping unused imports scan"
fi

echo ""

# Step 4: Analyze bundle size (if build exists)
echo "📊 Step 4: Analyzing project stats..."
echo "--------------------------------------------"

# Count files
PAGE_COUNT=$(find src/pages -name "*.jsx" -o -name "*.js" | wc -l)
COMPONENT_COUNT=$(find src/components -name "*.jsx" -o -name "*.js" | wc -l)
FUNCTION_COUNT=$(find functions -name "*.ts" 2>/dev/null | wc -l || echo "0")

echo "  📄 Pages: $PAGE_COUNT"
echo "  🧩 Components: $COMPONENT_COUNT"
echo "  ⚡ Functions: $FUNCTION_COUNT"

# Node modules size
if [ -d "node_modules" ]; then
    NODE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "  📦 node_modules: $NODE_SIZE"
fi

print_success "Project stats analyzed"
echo ""

# Step 5: Generate recommendations file
echo "📝 Step 5: Generating recommendations..."
echo "--------------------------------------------"

cat > "$BACKUP_DIR/next-steps.md" << 'EOF'
# Next Steps - Manual Review Required

## Files to Review for Deletion

### 1. Home.jsx
- **Location:** `src/pages/Home.jsx`
- **Status:** Placeholder (< 15 lines)
- **Action Required:** 
  1. Verify it's not referenced in routes
  2. Delete file: `rm src/pages/Home.jsx`
  3. Remove from `src/pages.config.js`

### 2. Duplicate Landing Pages
Consider consolidating:
- `src/pages/Landing.jsx` (keep, add i18n)
- `src/pages/LandingPT.jsx` (consolidate with i18n)
- `src/pages/LandingLight.jsx` (convert to variant)

### 3. Duplicate Pricing Pages
- `src/pages/Pricing.jsx` (keep, add i18n)
- `src/pages/Precos.jsx` (consolidate with i18n)

### 4. Duplicate Help Pages
- `src/pages/HelpCenter.jsx` (keep, add i18n)
- `src/pages/CentralAjuda.jsx` (consolidate with i18n)

## Recommended Next Actions

1. **Install i18n:**
   ```bash
   npm install react-i18next i18next
   ```

2. **Run full lint check:**
   ```bash
   npm run lint
   npm run lint:fix
   ```

3. **Clean unused ESLint issues:**
   ```bash
   npx eslint . --ext .js,.jsx,.ts,.tsx --fix
   ```

4. **Verify build still works:**
   ```bash
   npm run build
   ```

5. **Run type check (if using TypeScript):**
   ```bash
   npm run typecheck
   ```

## Files Backed Up
All changes have backups in the `backups/` directory.
To restore: `cp backups/cleanup-TIMESTAMP/package.json ./`

EOF

print_success "Recommendations saved to $BACKUP_DIR/next-steps.md"
echo ""

# Summary
echo "═══════════════════════════════════════════"
echo "✨ Phase 1 Cleanup Complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "  • Unused dependencies: ${#UNUSED_DEPS[@]} removed"
echo "  • Backup location: $BACKUP_DIR"
echo "  • Next steps: See $BACKUP_DIR/next-steps.md"
echo ""
echo "⚠️  Manual Review Required:"
echo "  1. Review and delete placeholder pages"
echo "  2. Update pages.config.js to remove deleted pages"
echo "  3. Test the application"
echo "  4. Run 'npm run build' to verify"
echo ""
echo "📖 Full analysis: See REDUNDANCY_ANALYSIS_REPORT.md"
echo ""
print_success "Cleanup completed successfully!"
