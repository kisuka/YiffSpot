# Changelog

## [3.0.0] - 2021.11.28
### Changed
- Upgraded all dependencies to latest version.
- Installed bufferutil and utf-8-validate.
- Revamp of frontend view using Bootstrap 5.
- Revamp of some of the backend.
- Escape html tags instead of removing it.
- Settings save automaticlly now.
- Dark mode is the default now.
- Use ES6 coding styles.
- The two eval function inside `find-partner` has been replaced.
- No more "Invalid preference" bug.
- Added a disconnect button.
- Fixed alert bug.
- Instead of `confirm()` or `alert()`, we use toast instead.
- Custom ping message, Ping/Pong frame doesn't seems to work.

### Removed
- Removed link restrictions.
- Removed save preferences button.
- Removed same host websocket restrictions.

### Added
- Protogen & Octopus to species list

## [2.6.0] - 2018.01.06
### Changed
- Replaced socket.io on server with ws.
- Replaced socket.io on client with native WebSockets.

### Removed
- js-cookie dependency.

## [2.5.2] - 2017.10.26
### Changed
- Fixed issue where partner typing was showing after leaving a partner.
- No longer automatically try to find a new partner after disconnect, block or leave.

## [2.5.1] - 2017.10.24
### Changed
- Fixed issue with Any / All always being selected.

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
