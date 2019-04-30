#include <iostream>
#include "Queens.h"

using namespace std;


void solveFrom(Queens &config)
{
	if(config.isSolved()) config.print();
	else
	{
		for(int col = 0; col < config.size(); col++)
		{
			if(config.unguarded(col))
			{
				config.insert(col);
				solveFrom(config);
				config.remove(col);
			}
		}
	}
}

int main()
{
	int n;
	cout << "Enter the number of queens: ";
	cin >> n;
	cout << n << endl;
	
	Queens config(n);
	solveFrom(config);

	return 0;
}
