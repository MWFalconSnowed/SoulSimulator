using System;
using System.Text.RegularExpressions;

namespace SoulScriptWinForms
{
    public static class SoulInterpreter
    {
        public static string Run(string code)
        {
            try
            {
                string output = "";

                if (code.Contains("component Atom"))
                {
                    float energy = 100;
                    float charge = -1;

                    for (int i = 0; i < 5; i++)
                    {
                        energy += charge * 1.0f;
                        if (energy < 0)
                        {
                            output += $"[Atom] Destroyed (energy < 0)\n";
                            break;
                        }
                        else
                        {
                            output += $"[Atom] Energy: {energy}\n";
                        }
                    }
                }

                if (code.Contains("component Spawner"))
                {
                    float timer = 0.0f;
                    float rate = 2.0f;

                    for (int i = 0; i < 5; i++)
                    {
                        timer += 1.0f;
                        if (timer > rate)
                        {
                            output += $"[Spawner] Spawned new Atom\n";
                            timer = 0.0f;
                        }
                        else
                        {
                            output += $"[Spawner] Waiting... ({timer}s)\n";
                        }
                    }
                }

                if (string.IsNullOrEmpty(output))
                    return "No known component found.";

                return output;
            }
            catch (Exception ex)
            {
                return "Error: " + ex.Message;
            }
        }
    }
}