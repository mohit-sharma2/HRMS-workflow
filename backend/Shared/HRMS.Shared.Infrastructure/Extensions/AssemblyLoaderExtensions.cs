using System.Reflection;

namespace HRMS.Shared.Infrastructure.Extensions
{
    public static class AssemblyLoaderExtensions
    {
        public static IEnumerable<Assembly> LoadAllAssemblies()
        {
            var loadedAssemblies = AppDomain.CurrentDomain.GetAssemblies().ToList();

            var basePath = AppContext.BaseDirectory;

            var dllFiles = Directory.GetFiles(basePath, "*.dll", SearchOption.TopDirectoryOnly);

            foreach (var dll in dllFiles)
            {
                try
                {
                    var assemblyName = AssemblyName.GetAssemblyName(dll);

                    if (loadedAssemblies.Any(a => a.FullName == assemblyName.FullName))
                        continue;

                    var assembly = Assembly.Load(assemblyName);
                    loadedAssemblies.Add(assembly);
                }
                catch
                {
                    // Ignore invalid/native assemblies (VERY IMPORTANT)
                }
            }

            return loadedAssemblies;
        }
    }
}