/*
	Copyright Myles Trevino
	Licensed under the Apache License, Version 2.0
	http://www.apache.org/licenses/LICENSE-2.0
*/


!macro customHeader
	ManifestDPIAware true
!macroend


# Checks the registry for existing installations and deletes the appropriate keys.
!macro checkRegistry

	# Check whether there is a user installation.
	ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "QuietUninstallString"
	StrCmp $0 "" 0 RemoveRegistryKeys

	# Check whether there is a machine installation.
	ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "QuietUninstallString"
	StrCmp $0 "" proceed removeRegistryKeys

	# Remove the keys.
	removeRegistryKeys:
		ReadRegStr $0 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "QuietUninstallString"
		StrCmp $0 "" proceed 0
		DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"

	proceed:

!macroend


!macro customInit
	!insertmacro checkRegistry
!macroend
