using System;
class Program
{
    static Func<int, int> Square = x => x * x;
    static void Main(string[] args)
    {
        int num = 10;
        Console.WriteLine(Square(num));

        Console.ReadKey();
    }
}