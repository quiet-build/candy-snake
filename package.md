# package.json

## Purpose

Documents package.json, a package manifest in this project.

## Behavior

Declares package scripts, dependencies, and the pinned pnpm version. `pnpm-lock.yaml` is the only dependency lockfile; install with `pnpm install --frozen-lockfile` in CI. `pnpm-workspace.yaml` approves esbuild's required install script without combining this repository with the other games.

## Maintenance

Update this companion when package.json changes in a way that affects public behavior, configuration, dependencies, data shape, or maintenance expectations.
