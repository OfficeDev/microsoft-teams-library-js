#
# Copyright (c) Microsoft Corporation.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
#
#Helper functions for PackageManagement DSC Resouces

Import-LocalizedData -BindingVariable LocalizedData -filename PackageManagementDscUtilities.strings.psd1


 Function ExtractArguments
{
    <#
    .SYNOPSIS

    This is a helper function that extract the parameters from a given table. 

    .PARAMETER FunctionBoundParameters
    Specifies the hashtable containing a set of parameters to be extracted

    .PARAMETER ArgumentNames
    Specifies A list of arguments you want to extract
    #>

    Param
    (
        [parameter(Mandatory = $true)]
        [System.Collections.Hashtable]
        $FunctionBoundParameters,

        #A list of arguments you want to extract
        [parameter(Mandatory = $true)]
        [System.String[]]$ArgumentNames
    )

    Write-Verbose -Message ($LocalizedData.CallingFunction -f $($MyInvocation.mycommand))

    $returnValue=@{}

    foreach ($arg in $ArgumentNames)
    {
        if($FunctionBoundParameters.ContainsKey($arg))
        {
            #Found an argument we are looking for, so we add it to return collection
            $returnValue.Add($arg,$FunctionBoundParameters[$arg])
        }
    }

    return $returnValue
 }

function ThrowError
{
    <#
    .SYNOPSIS

    This is a helper function that throws an error. 

    .PARAMETER ExceptionName
    Specifies the type of errors, e.g. System.ArgumentException

    .PARAMETER ExceptionMessage
    Specifies the exception message

    .PARAMETER ErrorId
    Specifies an identifier of the error

    .PARAMETER ErrorCategory
    Specifies the error category, e.g., InvalidArgument defined in System.Management.Automation. 

    #>

    param
    (        
        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [System.String]        
        $ExceptionName,

        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [System.String]
        $ExceptionMessage,      
        
        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [System.String]
        $ErrorId,

        [parameter(Mandatory = $true)]
        [ValidateNotNull()]
        [System.Management.Automation.ErrorCategory]
        $ErrorCategory
    )
    
    Write-Verbose -Message ($LocalizedData.CallingFunction -f $($MyInvocation.mycommand))
        
    $exception   = New-Object -TypeName $ExceptionName -ArgumentList $ExceptionMessage;
    $errorRecord = New-Object -TypeName System.Management.Automation.ErrorRecord -ArgumentList ($exception, $ErrorId, $ErrorCategory, $null)    
    throw $errorRecord
}

Function ValidateArgument
{
    <#
    .SYNOPSIS

    This is a helper function that validates the arguments. 

    .PARAMETER Argument
    Specifies the argument to be validated.

    .PARAMETER Type
    Specifies the type of argument.
    #>

    [CmdletBinding()]
    param
    (
        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [string]$Argument,

        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [String]$Type,

        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [String]$ProviderName
    )

    Write-Verbose -Message ($LocalizedData.CallingFunction -f $($MyInvocation.mycommand))

    switch ($Type)
    {

        "SourceUri"
        {
            # Checks whether given URI represents specific scheme
            # Most common schemes: file, http, https, ftp        
            $scheme =@('http', 'https', 'file', 'ftp')
 
            $newUri = $Argument -as [System.URI]  
            $returnValue = ($newUri -and $newUri.AbsoluteURI -and ($scheme -icontains $newuri.Scheme)) 

            if ($returnValue -eq $false)
            {                
                ThrowError  -ExceptionName "System.ArgumentException" `
                            -ExceptionMessage ($LocalizedData.InValidUri -f $Argument)`
                            -ErrorId "InValidUri" `
                            -ErrorCategory InvalidArgument
            }
            
            #Check whether it's a valid uri. Wait for the response within 2mins.
            <#$result = Invoke-WebRequest $newUri -TimeoutSec 120 -UseBasicParsing -ErrorAction SilentlyContinue

            if ($null -eq (([xml]$result.Content).service ))
            {
                ThrowError  -ExceptionName "System.ArgumentException" `
                            -ExceptionMessage ($LocalizedData.InValidUri -f $Argument)`
                            -ErrorId "InValidUri" `
                            -ErrorCategory InvalidArgument
            }#>
                                         
        }
        "DestinationPath"
        {
            $returnValue = Test-Path -Path $Argument
            if ($returnValue -eq $false)
            {
                ThrowError  -ExceptionName "System.ArgumentException" `
                            -ExceptionMessage ($LocalizedData.PathDoesNotExist -f $Argument)`
                            -ErrorId "PathDoesNotExist" `
                            -ErrorCategory InvalidArgument
            }
        }
        "PackageSource"
        {      
            #Argument can be either the package source Name or source Uri.  
            
            #Check if the source is a uri 
            $uri = $Argument -as [System.URI]  

            if($uri -and $uri.AbsoluteURI) 
            {
                # Check if it's a valid Uri
                ValidateArgument -Argument $Argument -Type "SourceUri" -ProviderName $ProviderName
            }
            else
            {
                #Check if it's a registered package source name                                                             
                $source = PackageManagement\Get-PackageSource -Name $Argument -ProviderName $ProviderName -verbose -ErrorVariable ev
                if ((-not $source) -or $ev) 
                {
                    #We do not need to throw error here as Get-PackageSource does already
                    Write-Verbose -Message ($LocalizedData.SourceNotFound -f $source)                
                }
            }
        }
        default
        {
            ThrowError  -ExceptionName "System.ArgumentException" `
                        -ExceptionMessage ($LocalizedData.UnexpectedArgument -f $Type)`
                        -ErrorId "UnexpectedArgument" `
                        -ErrorCategory InvalidArgument
        }
     }           
}

Function ValidateVersionArgument
{
    <#
    .SYNOPSIS

    This is a helper function that does the version validation. 

    .PARAMETER RequiredVersion
    Provides the required version.

    .PARAMETER MaximumVersion
    Provides the maximum version.

    .PARAMETER MinimumVersion
    Provides the minimum version.
    #>

    [CmdletBinding()]
    param
    (
        [string]$RequiredVersion,
        [string]$MinimumVersion,
        [string]$MaximumVersion

    )
         
    Write-Verbose -Message ($LocalizedData.CallingFunction -f $($MyInvocation.mycommand))

    $isValid = $false
         
    #Case 1: No further check required if a user provides either none or one of these: minimumVersion, maximumVersion, and requiredVersion
    if ($PSBoundParameters.Count -le 1)
    {
        return $true
    }

    #Case 2: #If no RequiredVersion is provided 
    if (-not $PSBoundParameters.ContainsKey('RequiredVersion'))
    {
        #If no RequiredVersion, both MinimumVersion and MaximumVersion are provided. Otherwise fall into the Case #1
        $isValid = $PSBoundParameters['MinimumVersion'] -le $PSBoundParameters['MaximumVersion']
    }
    
    #Case 3: RequiredVersion is provided. 
    #        In this case  MinimumVersion and/or MaximumVersion also are provided. Otherwise fall in to Case #1.
    #        This is an invalid case. When RequiredVersion is provided, others are not allowed. so $isValid is false, which is already set in the init

    if ($isValid -eq $false)
    {        
        ThrowError  -ExceptionName "System.ArgumentException" `
                    -ExceptionMessage ($LocalizedData.VersionError)`
                    -ErrorId "VersionError" `
                    -ErrorCategory InvalidArgument
    }
}

Function Get-InstallationPolicy
{
    <#
    .SYNOPSIS

    This is a helper function that retrives the InstallationPolicy from the given repository. 

    .PARAMETER RepositoryName
    Provides the repository Name.

    #>

    Param
    (
        [parameter(Mandatory = $true)]
        [ValidateNotNullOrEmpty()]
        [System.String]$RepositoryName
    )

    Write-Verbose -Message ($LocalizedData.CallingFunction -f $($MyInvocation.mycommand))

    $repositoryobj = PackageManagement\Get-PackageSource -Name $RepositoryName -ErrorAction SilentlyContinue -WarningAction SilentlyContinue

    if ($repositoryobj)
    {      
        return $repositoryobj.IsTrusted
    }                  
}

# SIG # Begin signature block
# MIIkWwYJKoZIhvcNAQcCoIIkTDCCJEgCAQExDzANBglghkgBZQMEAgEFADB5Bgor
# BgEEAYI3AgEEoGswaTA0BgorBgEEAYI3AgEeMCYCAwEAAAQQH8w7YFlLCE63JNLG
# KX7zUQIBAAIBAAIBAAIBAAIBADAxMA0GCWCGSAFlAwQCAQUABCD+xe8u4YoS6UEO
# jtW70wceL89huvuluOvdcbeefpOXLqCCDYEwggX/MIID56ADAgECAhMzAAABh3IX
# chVZQMcJAAAAAAGHMA0GCSqGSIb3DQEBCwUAMH4xCzAJBgNVBAYTAlVTMRMwEQYD
# VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25p
# bmcgUENBIDIwMTEwHhcNMjAwMzA0MTgzOTQ3WhcNMjEwMzAzMTgzOTQ3WjB0MQsw
# CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9u
# ZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMR4wHAYDVQQDExVNaWNy
# b3NvZnQgQ29ycG9yYXRpb24wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB
# AQDOt8kLc7P3T7MKIhouYHewMFmnq8Ayu7FOhZCQabVwBp2VS4WyB2Qe4TQBT8aB
# znANDEPjHKNdPT8Xz5cNali6XHefS8i/WXtF0vSsP8NEv6mBHuA2p1fw2wB/F0dH
# sJ3GfZ5c0sPJjklsiYqPw59xJ54kM91IOgiO2OUzjNAljPibjCWfH7UzQ1TPHc4d
# weils8GEIrbBRb7IWwiObL12jWT4Yh71NQgvJ9Fn6+UhD9x2uk3dLj84vwt1NuFQ
# itKJxIV0fVsRNR3abQVOLqpDugbr0SzNL6o8xzOHL5OXiGGwg6ekiXA1/2XXY7yV
# Fc39tledDtZjSjNbex1zzwSXAgMBAAGjggF+MIIBejAfBgNVHSUEGDAWBgorBgEE
# AYI3TAgBBggrBgEFBQcDAzAdBgNVHQ4EFgQUhov4ZyO96axkJdMjpzu2zVXOJcsw
# UAYDVR0RBEkwR6RFMEMxKTAnBgNVBAsTIE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1
# ZXJ0byBSaWNvMRYwFAYDVQQFEw0yMzAwMTIrNDU4Mzg1MB8GA1UdIwQYMBaAFEhu
# ZOVQBdOCqhc3NyK1bajKdQKVMFQGA1UdHwRNMEswSaBHoEWGQ2h0dHA6Ly93d3cu
# bWljcm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY0NvZFNpZ1BDQTIwMTFfMjAxMS0w
# Ny0wOC5jcmwwYQYIKwYBBQUHAQEEVTBTMFEGCCsGAQUFBzAChkVodHRwOi8vd3d3
# Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NlcnRzL01pY0NvZFNpZ1BDQTIwMTFfMjAx
# MS0wNy0wOC5jcnQwDAYDVR0TAQH/BAIwADANBgkqhkiG9w0BAQsFAAOCAgEAixmy
# S6E6vprWD9KFNIB9G5zyMuIjZAOuUJ1EK/Vlg6Fb3ZHXjjUwATKIcXbFuFC6Wr4K
# NrU4DY/sBVqmab5AC/je3bpUpjtxpEyqUqtPc30wEg/rO9vmKmqKoLPT37svc2NV
# BmGNl+85qO4fV/w7Cx7J0Bbqk19KcRNdjt6eKoTnTPHBHlVHQIHZpMxacbFOAkJr
# qAVkYZdz7ikNXTxV+GRb36tC4ByMNxE2DF7vFdvaiZP0CVZ5ByJ2gAhXMdK9+usx
# zVk913qKde1OAuWdv+rndqkAIm8fUlRnr4saSCg7cIbUwCCf116wUJ7EuJDg0vHe
# yhnCeHnBbyH3RZkHEi2ofmfgnFISJZDdMAeVZGVOh20Jp50XBzqokpPzeZ6zc1/g
# yILNyiVgE+RPkjnUQshd1f1PMgn3tns2Cz7bJiVUaqEO3n9qRFgy5JuLae6UweGf
# AeOo3dgLZxikKzYs3hDMaEtJq8IP71cX7QXe6lnMmXU/Hdfz2p897Zd+kU+vZvKI
# 3cwLfuVQgK2RZ2z+Kc3K3dRPz2rXycK5XCuRZmvGab/WbrZiC7wJQapgBodltMI5
# GMdFrBg9IeF7/rP4EqVQXeKtevTlZXjpuNhhjuR+2DMt/dWufjXpiW91bo3aH6Ea
# jOALXmoxgltCp1K7hrS6gmsvj94cLRf50QQ4U8Qwggd6MIIFYqADAgECAgphDpDS
# AAAAAAADMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
# V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
# IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0
# ZSBBdXRob3JpdHkgMjAxMTAeFw0xMTA3MDgyMDU5MDlaFw0yNjA3MDgyMTA5MDla
# MH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
# ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNVBAMT
# H01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENBIDIwMTEwggIiMA0GCSqGSIb3DQEB
# AQUAA4ICDwAwggIKAoICAQCr8PpyEBwurdhuqoIQTTS68rZYIZ9CGypr6VpQqrgG
# OBoESbp/wwwe3TdrxhLYC/A4wpkGsMg51QEUMULTiQ15ZId+lGAkbK+eSZzpaF7S
# 35tTsgosw6/ZqSuuegmv15ZZymAaBelmdugyUiYSL+erCFDPs0S3XdjELgN1q2jz
# y23zOlyhFvRGuuA4ZKxuZDV4pqBjDy3TQJP4494HDdVceaVJKecNvqATd76UPe/7
# 4ytaEB9NViiienLgEjq3SV7Y7e1DkYPZe7J7hhvZPrGMXeiJT4Qa8qEvWeSQOy2u
# M1jFtz7+MtOzAz2xsq+SOH7SnYAs9U5WkSE1JcM5bmR/U7qcD60ZI4TL9LoDho33
# X/DQUr+MlIe8wCF0JV8YKLbMJyg4JZg5SjbPfLGSrhwjp6lm7GEfauEoSZ1fiOIl
# XdMhSz5SxLVXPyQD8NF6Wy/VI+NwXQ9RRnez+ADhvKwCgl/bwBWzvRvUVUvnOaEP
# 6SNJvBi4RHxF5MHDcnrgcuck379GmcXvwhxX24ON7E1JMKerjt/sW5+v/N2wZuLB
# l4F77dbtS+dJKacTKKanfWeA5opieF+yL4TXV5xcv3coKPHtbcMojyyPQDdPweGF
# RInECUzF1KVDL3SV9274eCBYLBNdYJWaPk8zhNqwiBfenk70lrC8RqBsmNLg1oiM
# CwIDAQABo4IB7TCCAekwEAYJKwYBBAGCNxUBBAMCAQAwHQYDVR0OBBYEFEhuZOVQ
# BdOCqhc3NyK1bajKdQKVMBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
# DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFHItOgIxkEO5FAVO
# 4eqnxzHRI4k0MFoGA1UdHwRTMFEwT6BNoEuGSWh0dHA6Ly9jcmwubWljcm9zb2Z0
# LmNvbS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dDIwMTFfMjAxMV8wM18y
# Mi5jcmwwXgYIKwYBBQUHAQEEUjBQME4GCCsGAQUFBzAChkJodHRwOi8vd3d3Lm1p
# Y3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dDIwMTFfMjAxMV8wM18y
# Mi5jcnQwgZ8GA1UdIASBlzCBlDCBkQYJKwYBBAGCNy4DMIGDMD8GCCsGAQUFBwIB
# FjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2RvY3MvcHJpbWFyeWNw
# cy5odG0wQAYIKwYBBQUHAgIwNB4yIB0ATABlAGcAYQBsAF8AcABvAGwAaQBjAHkA
# XwBzAHQAYQB0AGUAbQBlAG4AdAAuIB0wDQYJKoZIhvcNAQELBQADggIBAGfyhqWY
# 4FR5Gi7T2HRnIpsLlhHhY5KZQpZ90nkMkMFlXy4sPvjDctFtg/6+P+gKyju/R6mj
# 82nbY78iNaWXXWWEkH2LRlBV2AySfNIaSxzzPEKLUtCw/WvjPgcuKZvmPRul1LUd
# d5Q54ulkyUQ9eHoj8xN9ppB0g430yyYCRirCihC7pKkFDJvtaPpoLpWgKj8qa1hJ
# Yx8JaW5amJbkg/TAj/NGK978O9C9Ne9uJa7lryft0N3zDq+ZKJeYTQ49C/IIidYf
# wzIY4vDFLc5bnrRJOQrGCsLGra7lstnbFYhRRVg4MnEnGn+x9Cf43iw6IGmYslmJ
# aG5vp7d0w0AFBqYBKig+gj8TTWYLwLNN9eGPfxxvFX1Fp3blQCplo8NdUmKGwx1j
# NpeG39rz+PIWoZon4c2ll9DuXWNB41sHnIc+BncG0QaxdR8UvmFhtfDcxhsEvt9B
# xw4o7t5lL+yX9qFcltgA1qFGvVnzl6UJS0gQmYAf0AApxbGbpT9Fdx41xtKiop96
# eiL6SJUfq/tHI4D1nvi/a7dLl+LrdXga7Oo3mXkYS//WsyNodeav+vyL6wuA6mk7
# r/ww7QRMjt/fdW1jkT3RnVZOT7+AVyKheBEyIXrvQQqxP/uozKRdwaGIm1dxVk5I
# RcBCyZt2WwqASGv9eZ/BvW1taslScxMNelDNMYIWMDCCFiwCAQEwgZUwfjELMAkG
# A1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
# HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEoMCYGA1UEAxMfTWljcm9z
# b2Z0IENvZGUgU2lnbmluZyBQQ0EgMjAxMQITMwAAAYdyF3IVWUDHCQAAAAABhzAN
# BglghkgBZQMEAgEFAKCBrjAZBgkqhkiG9w0BCQMxDAYKKwYBBAGCNwIBBDAcBgor
# BgEEAYI3AgELMQ4wDAYKKwYBBAGCNwIBFTAvBgkqhkiG9w0BCQQxIgQgCZ2K5xbK
# 27tyibqtMV5AHpyNN7lNy3nCNEZ+gshCPtAwQgYKKwYBBAGCNwIBDDE0MDKgFIAS
# AE0AaQBjAHIAbwBzAG8AZgB0oRqAGGh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbTAN
# BgkqhkiG9w0BAQEFAASCAQAyeEIPHCeezdvuJlvHLPAx0mBb2+36yOGP5QAIT6x/
# eMCsK3QEYylFlfSjDsBWHUFweyharjwu/sw/KDZcbfwz82aaOpkxbuAhPjHRX84S
# pqHxNxw7PHq6N6XOoe61YLEa93OF3A9WACsenIrjBssA6IhSr/Q/oVR78MKxh6VH
# qGAthEaOm/NKb8c0DmhUiHKtZMy05oNYDMkYcCyehhCBLf9/nehabRuHk8vMf0AF
# 5WsJQaUvARJRhXJamv1Mr9WVKXhW+nBCmauazkJIagJNuakh1ype4/gNAKTit4H5
# MghO2ERzx1XVg1Kvrsu87VdPXBHf+remb0JvXcYQyXndoYITujCCE7YGCisGAQQB
# gjcDAwExghOmMIITogYJKoZIhvcNAQcCoIITkzCCE48CAQMxDzANBglghkgBZQME
# AgEFADCCAVgGCyqGSIb3DQEJEAEEoIIBRwSCAUMwggE/AgEBBgorBgEEAYRZCgMB
# MDEwDQYJYIZIAWUDBAIBBQAEIAMc3Z52CqtJPqjV3aVgo0scv2C5S/V6jiQGZXcy
# SupuAgZeoMfc5PYYEzIwMjAwNDI0MDExNzQ0LjI2NlowBwIBAYACAfSggdSkgdEw
# gc4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
# ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsT
# IE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFs
# ZXMgVFNTIEVTTjo3MjhELUM0NUYtRjlFQjElMCMGA1UEAxMcTWljcm9zb2Z0IFRp
# bWUtU3RhbXAgU2VydmljZaCCDyIwggT1MIID3aADAgECAhMzAAABBAkBdQhYhy0p
# AAAAAAEEMA0GCSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
# YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
# Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAy
# MDEwMB4XDTE5MDkwNjIwNDExOFoXDTIwMTIwNDIwNDExOFowgc4xCzAJBgNVBAYT
# AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
# VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29mdCBP
# cGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo3
# MjhELUM0NUYtRjlFQjElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
# dmljZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAMgtB6ARuhhmlpTh
# YPwWgmtO2oNVTTZyHgYQBc3GH/J1w6bhgTcgpNiZnGZe2kv1Abyg7ABSP6ekgpRh
# WpByx5gOeOxpllPXkCxpiMlKFFx++Rnxg0N1YFN2aAsVj9GRMWc3R6hPKtgFMHXU
# LPxji3fu6DTgjfOi2pih5r/O+cp1Oi8KvdT+8p5JlROk1/85nsTggE80CudP/Nhu
# iIrSvmDNKVmOMF3afUWUswVP6v6t9cGjSWG3GMGNZe8FB3VVOL+pNtCbRV83qhQt
# kyIyA8HvGaciAfrXZi/QD5C/vK7XcvoeHbizh7j5lXUD3PiH0ffqHvMp58lsU/Aj
# pqr5ZGcCAwEAAaOCARswggEXMB0GA1UdDgQWBBSY1V7fwkQaDhcBi/GZ08MisOia
# 6jAfBgNVHSMEGDAWgBTVYzpcijGQ80N7fEYbxTNoWoVtVTBWBgNVHR8ETzBNMEug
# SaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
# aWNUaW1TdGFQQ0FfMjAxMC0wNy0wMS5jcmwwWgYIKwYBBQUHAQEETjBMMEoGCCsG
# AQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Rp
# bVN0YVBDQV8yMDEwLTA3LTAxLmNydDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoG
# CCsGAQUFBwMIMA0GCSqGSIb3DQEBCwUAA4IBAQA9FdSzd2l8NAMX17RFeWLhOqnO
# AgyXIjH8tdW1yA94Zdzyn8NeukcjyIL7/Pkj8R7KEtEUL0cfRnds6KITaPBXxlos
# z1i+kMhfd6d4kSgnPWm0qoA14fqxJUM6P5fZfWRGUrtkNJha6N8Id1Ciuyibq7K0
# 3EnTLgli3EX1LXlzBOyyyjM3hDGVxgPk9D7Bw5ikgVju+Yql+tXjjgG/oFw+WJvw
# BN7YunaRV06JKZwsYGPsOYA1qyc8VXBoyeKGFKhI2oThT/P7IM3hCxLNc4fix3sL
# aKe4NZta0rjdssY8Kz+Z4sr8T9daXSFa7kUpKVw5277+0QFCc6bkrHjlKB/lMIIG
# cTCCBFmgAwIBAgIKYQmBKgAAAAAAAjANBgkqhkiG9w0BAQsFADCBiDELMAkGA1UE
# BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
# BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9zb2Z0
# IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIwMTAwHhcNMTAwNzAxMjEzNjU1
# WhcNMjUwNzAxMjE0NjU1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
# Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
# cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
# ASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKkdDbx3EYo6IOz8E5f1+n9p
# lGt0VBDVpQoAgoX77XxoSyxfxcPlYcJ2tz5mK1vwFVMnBDEfQRsalR3OCROOfGEw
# WbEwRA/xYIiEVEMM1024OAizQt2TrNZzMFcmgqNFDdDq9UeBzb8kYDJYYEbyWEeG
# MoQedGFnkV+BVLHPk0ySwcSmXdFhE24oxhr5hoC732H8RsEnHSRnEnIaIYqvS2SJ
# UGKxXf13Hz3wV3WsvYpCTUBR0Q+cBj5nf/VmwAOWRH7v0Ev9buWayrGo8noqCjHw
# 2k4GkbaICDXoeByw6ZnNPOcvRLqn9NxkvaQBwSAJk3jN/LzAyURdXhacAQVPIk0C
# AwEAAaOCAeYwggHiMBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBTVYzpcijGQ
# 80N7fEYbxTNoWoVtVTAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMAQTALBgNVHQ8E
# BAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
# kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5j
# b20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmww
# WgYIKwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29m
# dC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8yMDEwLTA2LTIzLmNydDCBoAYD
# VR0gAQH/BIGVMIGSMIGPBgkrBgEEAYI3LgMwgYEwPQYIKwYBBQUHAgEWMWh0dHA6
# Ly93d3cubWljcm9zb2Z0LmNvbS9QS0kvZG9jcy9DUFMvZGVmYXVsdC5odG0wQAYI
# KwYBBQUHAgIwNB4yIB0ATABlAGcAYQBsAF8AUABvAGwAaQBjAHkAXwBTAHQAYQB0
# AGUAbQBlAG4AdAAuIB0wDQYJKoZIhvcNAQELBQADggIBAAfmiFEN4sbgmD+BcQM9
# naOhIW+z66bM9TG+zwXiqf76V20ZMLPCxWbJat/15/B4vceoniXj+bzta1RXCCtR
# gkQS+7lTjMz0YBKKdsxAQEGb3FwX/1z5Xhc1mCRWS3TvQhDIr79/xn/yN31aPxzy
# mXlKkVIArzgPF/UveYFl2am1a+THzvbKegBvSzBEJCI8z+0DpZaPWSm8tv0E4XCf
# Mkon/VWvL/625Y4zu2JfmttXQOnxzplmkIz/amJ/3cVKC5Em4jnsGUpxY517IW3D
# nKOiPPp/fZZqkHimbdLhnPkd/DjYlPTGpQqWhqS9nhquBEKDuLWAmyI4ILUl5WTs
# 9/S/fmNZJQ96LjlXdqJxqgaKD4kWumGnEcua2A5HmoDF0M2n0O99g/DhO3EJ3110
# mCIIYdqwUB5vvfHhAN/nMQekkzr3ZUd46PioSKv33nJ+YWtvd6mBy6cJrDm77MbL
# 2IK0cs0d9LiFAR6A+xuJKlQ5slvayA1VmXqHczsI5pgt6o3gMy4SKfXAL1QnIffI
# rE7aKLixqduWsqdCosnPGUFN4Ib5KpqjEWYw07t0MkvfY3v1mYovG8chr1m1rtxE
# PJdQcdeh0sVV42neV8HR3jDA/czmTfsNv11P6Z0eGTgvvM9YBS7vDaBQNdrvCScc
# 1bN+NR4Iuto229Nfj950iEkSoYIDsDCCApgCAQEwgf6hgdSkgdEwgc4xCzAJBgNV
# BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
# HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29m
# dCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVT
# Tjo3MjhELUM0NUYtRjlFQjElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
# U2VydmljZaIlCgEBMAkGBSsOAwIaBQADFQCzRh5/R0jzKEyIVLZzGHgW3BUKfaCB
# 3jCB26SB2DCB1TELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAO
# BgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEp
# MCcGA1UECxMgTWljcm9zb2Z0IE9wZXJhdGlvbnMgUHVlcnRvIFJpY28xJzAlBgNV
# BAsTHm5DaXBoZXIgTlRTIEVTTjo0REU5LTBDNUUtM0UwOTErMCkGA1UEAxMiTWlj
# cm9zb2Z0IFRpbWUgU291cmNlIE1hc3RlciBDbG9jazANBgkqhkiG9w0BAQUFAAIF
# AOJMR0MwIhgPMjAyMDA0MjQwMDU2MzVaGA8yMDIwMDQyNTAwNTYzNVowdzA9Bgor
# BgEEAYRZCgQBMS8wLTAKAgUA4kxHQwIBADAKAgEAAgIQsAIB/zAHAgEAAgIY9jAK
# AgUA4k2YwwIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZCgMBoAowCAIB
# AAIDFuNgoQowCAIBAAIDB6EgMA0GCSqGSIb3DQEBBQUAA4IBAQCU62Zx3p4eDKjR
# X6SThnb5SUK7xq3KMucFnp+c0dUmGrX2yQLhXkhHloWkKw7mjEdjZrMc98gYZGqA
# Y0ziY9vEjIQWvsF9F2xENTDkTmPalXGX4M30fW4HjGpids9Ey5G6un4sOV78hzsD
# eI/p41S2KXuWRwBIpG0s/h/eA7Kn7mkWpBDVjVuk4t4xTCTR7z/ms+itrqCOuFcV
# HRhoWWkE+OZl/Din7GejZIuo0o1oKcFAIuEOG/WODi0uSZcLFpKLPfiK/BK2nFFv
# Gha8r9VK7hXGCCeIFUQ7cRGYAUuYjc5BsGLCaDeq6p6NK9/VwC1r9wmt2wzEdA/h
# a6OIafxiMYIC9TCCAvECAQEwgZMwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
# c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
# b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
# MTACEzMAAAEECQF1CFiHLSkAAAAAAQQwDQYJYIZIAWUDBAIBBQCgggEyMBoGCSqG
# SIb3DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQgHn2Eb60N7JNv
# 3A3vUOf5J/ZyYXxiwaHelyJ17ZCZDeYwgeIGCyqGSIb3DQEJEAIMMYHSMIHPMIHM
# MIGxBBSzRh5/R0jzKEyIVLZzGHgW3BUKfTCBmDCBgKR+MHwxCzAJBgNVBAYTAlVT
# MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
# ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
# LVN0YW1wIFBDQSAyMDEwAhMzAAABBAkBdQhYhy0pAAAAAAEEMBYEFPnzEPMl8q6k
# HOyQFJu9m/ZL40eoMA0GCSqGSIb3DQEBCwUABIIBAIbZuY7fGpCJcVSCjgBYq8ny
# ZS18sH7qH0BTCqgcgR8ghDn1NZ4Y6bKDfBQkwfwDWNWVpwAex06skEbw/tdmv70b
# nIzcTGjatnE2UhTLhf5DkkIb909A6lcjHa8z1Jirp2CYS4XFchzBRUmTvbFUeARn
# ou5BeU6YgdUYlkGnJ9xD3loc6+HvRz09U9XxSZmy0tctC3jNMv92wSFi2kKcmt7i
# 9xzUxj4Ia+jA8G4zr6nZ1bKSIZ4PJ2AhgU0ZC6FFtrj5+7Q+xwaWiHHqyILB35/K
# k7qonnRYsNjUjEV6mMWyBU1uS4JTUWYJXNDXvi08PG0tf5gKtPAvt8NixqJE43w=
# SIG # End signature block
