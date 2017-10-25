# Changelog

## [2.5.0] - 2017.10.24
### Added
- Changelog file for easier reading of what has changed.
- Config file added for easier configuration changes.
- Support for running multiple servers.
- Users now have a unique identifier for 24 hours to fix issues with blocking and reconnections.
- Prevention of multiple active sessions.
- Strict mode enabled.

### Changed
- Replaced jade view engine with pug
- Major rewrites to both client and server.
- Restrict transport to websockets only.
- Better information on README.md
- Updated npm dependencies.

### Removed
- Unnecessary dependency: *ws*.
