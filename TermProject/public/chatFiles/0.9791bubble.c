#include <stdio.h>
#include <stdlib.h>
#include <time.h>
/*  generate a bubble sort question  */

#define N 10
#define debug 0

void swap(int *i, int *j)
  {
    int t = *i; *i = *j; *j = t;
  }

/*  do one pass of the bubble sort  */
void sort(int ar[], int n)
  {
    int i;

    for (i = 0; i < n - 1; i++)
      if (ar[i] > ar[i + 1])
        swap(&ar[i], &ar[i + 1]);
  }


void main()
{
  int i, kk, t, ar[N];
  /* generate n random numbers */
  printf("Content-type: text/html\n\n");
  printf("<html><body>");
  printf("<pre>"); 

  srand(time(0));

  ar[0] = rand()%20 + 5;
  for (i = 1; i < N; i++)
    ar[i] = ar[i - 1] + rand()%9 + 1;

  for (i = N-1; i > 0; i--)
    {
      t = rand()%N;
      swap(&ar[t], &ar[i]);
    }

  printf("\n\n\n");
  printf("^Bubble Sort\n");
  printf("~Given the following numbers in array A ...\n");
  printf("\n");
    for (i=0; i < N; i++) printf("%d  ",ar[i]); printf("\n");
  printf("\n");
  printf("\n");
  printf("... what is the contents of array A after the first pass of a Bubble Sort?\n");
  printf("The numbers are being sorted into ascending order.\n");

  printf("\n\n");
  printf("a. ");
  sort(ar,N);
    for (i=0; i < N; i++) printf("%d  ",ar[i]); printf("\n");
  printf("b. ");
  sort(ar,N);
    for (i=0; i < N; i++) printf("%d  ",ar[i]); printf("\n");
  printf("c. ");
  sort(ar,N);
    for (i=0; i < N; i++) printf("%d  ",ar[i]); printf("\n");
  printf("d. ");
  sort(ar,N);
    for (i=0; i < N; i++) printf("%d  ",ar[i]); printf("\n");
  printf("e. None of the above []\n");
  printf("\n");
  printf("</pre></body></html>\n");
}
