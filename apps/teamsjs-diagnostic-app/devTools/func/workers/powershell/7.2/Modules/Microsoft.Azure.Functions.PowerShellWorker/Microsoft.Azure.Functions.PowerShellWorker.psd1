#
# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.
#

@{

# Version number of this module.
ModuleVersion = '0.3.0'

# Supported PSEditions
CompatiblePSEditions = @('Core')

# ID used to uniquely identify this module
GUID = 'f0149ba6-bd6f-4dbd-afe5-2a95bd755d6c'

# Author of this module
Author = 'Microsoft Corporation'

# Company or vendor of this module
CompanyName = 'Microsoft Corporation'

# Copyright statement for this module
Copyright = '(c) Microsoft Corporation. All rights reserved.'

# Description of the functionality provided by this module
Description = 'The module used in an Azure Functions environment for setting and retrieving Output Bindings.'

# Minimum version of the PowerShell engine required by this module
PowerShellVersion = '6.2'

# Modules that must be imported into the global environment prior to importing this module
RequiredModules = @()

# Assemblies that must be loaded prior to importing this module
RequiredAssemblies = @()

# Script files (.ps1) that are run in the caller's environment prior to importing this module.
ScriptsToProcess = @()

# Type files (.ps1xml) to be loaded when importing this module
TypesToProcess = @()

# Format files (.ps1xml) to be loaded when importing this module
FormatsToProcess = @()

# Modules to import as nested modules of the module specified in RootModule/ModuleToProcess
NestedModules = @('Microsoft.Azure.Functions.PowerShellWorker.psm1', 'Microsoft.Azure.Functions.PowerShellWorker.dll')

# Functions to export from this module, for best performance, do not use wildcards and do not delete the entry, use an empty array if there are no functions to export.
FunctionsToExport = @(
    'Get-DurableStatus',
    'New-DurableRetryOptions',
    'New-DurableOrchestrationCheckStatusResponse',
    'Send-DurableExternalEvent',
    'Start-DurableOrchestration',
    'Stop-DurableOrchestration')

# Cmdlets to export from this module, for best performance, do not use wildcards and do not delete the entry, use an empty array if there are no cmdlets to export.
CmdletsToExport = @(
    'Get-OutputBinding',
    'Get-DurableTaskResult'
    'Invoke-DurableActivity',
    'Push-OutputBinding',
    'Set-DurableCustomStatus',
    'Set-FunctionInvocationContext',
    'Start-DurableExternalEventListener',
    'Start-DurableTimer',
    'Stop-DurableTimerTask',
    'Trace-PipelineObject',
    'Wait-DurableTask')

# Variables to export from this module
VariablesToExport = @()

# Aliases to export from this module, for best performance, do not use wildcards and do not delete the entry, use an empty array if there are no aliases to export.
AliasesToExport = @(
    'Invoke-ActivityFunction',
    'New-OrchestrationCheckStatusResponse',
    'Start-NewOrchestration',
    'Wait-ActivityFunction')

# Private data to pass to the module specified in RootModule/ModuleToProcess. This may also contain a PSData hashtable with additional module metadata used by PowerShell.
PrivateData = @{

    PSData = @{

        # Tags applied to this module. These help with module discovery in online galleries.
        Tags = @('Microsoft', 'Azure', 'Functions', 'Serverless', 'Cloud')

        # A URL to the license for this module.
        LicenseUri = 'https://github.com/Azure/azure-functions-powershell-worker/blob/dev/LICENSE'

        # A URL to the main website for this project.
        ProjectUri = 'https://github.com/Azure/azure-functions-powershell-worker'

        # A URL to an icon representing this module.
        # IconUri = ''

        # ReleaseNotes of this module
        ReleaseNotes = '# 0.1.0
Initial Release.
'

    }
}
}
