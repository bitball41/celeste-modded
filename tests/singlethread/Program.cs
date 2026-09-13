using System;
using System.Runtime.InteropServices.JavaScript;
using System.Threading.Tasks;

public static partial class Program
{
    public static void Main() => Console.WriteLine("MANAGED_SINGLETHREAD_BOOT");

    [JSImport("pause", "probe")]
    private static partial Task Pause();

    [JSExport]
    public static async Task<string> TestAsyncInterop()
    {
        await Pause();
        return "MANAGED_SINGLETHREAD_INTEROP_PASS";
    }
}
