using System;

namespace Properties
{
    class Student
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string StudentID { get; private set; }

        public Student(string FirstName, string LastName, string StudentID)
        {
            this.FirstName = FirstName;
            this.LastName = LastName;
            this.StudentID = StudentID;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Student student1 = new Student("Robert", "Manley", "20432073");
            Console.WriteLine($"FirstName: {student1.FirstName}");
            Console.WriteLine($"LastName: {student1.LastName}");
            Console.WriteLine($"StudentID: {student1.StudentID}");

            student1.FirstName = "Canaan";
            //student1.StudentID = "this will produce an error due to the private access modifier";
            Console.WriteLine("\nUpdated Information:");
            Console.WriteLine($"FirstName: {student1.FirstName}");
            Console.WriteLine($"LastName: {student1.LastName}");
            Console.WriteLine($"StudentID: {student1.StudentID}");

            Console.ReadKey();
        }
    }
}