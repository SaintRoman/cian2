# Run from this repository: source .agents/motion-env.sh
MOTION_PROJECT_ROOT="$(git rev-parse --show-toplevel)" || return 1
export PATH="$MOTION_PROJECT_ROOT/.agents/tools/bin:$MOTION_PROJECT_ROOT/.agents/tools/venv/bin:$PATH"
export PLAYWRIGHT_BROWSERS_PATH="$MOTION_PROJECT_ROOT/.agents/tools/playwright-browsers"
