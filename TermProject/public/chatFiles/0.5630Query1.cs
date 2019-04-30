using System;
using System.Linq;

class Program
{
    static void Main(string[] args)
    {
        int[] testScores = { 100, 37, 88, 76, 89, 96, 78, 80, 93 , 90 };

        var topScores = 
            from score in testScores
            where score >= 90
            orderby score descending
            select score;

        foreach(int score in topScores)
        {
            Console.WriteLine(score);
        }

        Console.ReadKey();
    }
}