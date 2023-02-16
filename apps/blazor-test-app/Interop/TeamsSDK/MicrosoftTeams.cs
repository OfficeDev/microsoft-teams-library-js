using Microsoft.JSInterop;

namespace Blazor_Test_App.Interop.TeamsSDK;

public class MicrosoftTeams : InteropModuleBase
{
    protected override string ModulePath => "./js/TeamsJsBlazorInterop.js";

    public MicrosoftTeams(IJSRuntime jsRuntime) : base(jsRuntime) { }

    public Task InitializeAsync()
    {
        return InvokeVoidAsync("initializeAsync");
    }

    public Task<TeamsContext> GetTeamsContextAsync()
    {
        return InvokeAsync<TeamsContext>("getContextAsync");
    }

    public Task RegisterOnSaveHandlerAsync(TeamsInstanceSettings settings)
    {
        return InvokeVoidAsync("registerOnSaveHandler", settings);
    }

    public Task<bool> IsHostedInM365()
    {
        try
        {
            return InvokeAsync<bool>("isHostedInM365");
        }
        catch (JSException)
        {
            return Task.FromResult(false);
        }
    }

    public Task notifySuccess() 
    {
        return InvokeVoidAsync("notifySuccess");
    }
}
