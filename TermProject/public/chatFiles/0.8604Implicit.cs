using System;
class Program
{
    static void Main(string[] args)
    {
        int num = 10;
        var num2 = 10;

        string name = "Bob";
        var name2 = "Sally";

        Console.WriteLine($"Numbers: {num}, {num2}");
        Console.WriteLine($"Names: {name}, {name2}");

        Console.ReadKey();
    }
}