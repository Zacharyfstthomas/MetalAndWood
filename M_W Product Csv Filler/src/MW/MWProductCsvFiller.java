package MW;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;
import java.util.ArrayList;

public class MWProductCsvFiller {
	public static final String COMMA_DELIMITER = ",";
	public ArrayList<Design> designs;
		//Delimiters used in the CSV file
			
		public MWProductCsvFiller() {
			designs = new ArrayList<Design>(); 
		}	
		
		public void ReadMWSKUsAndNamesCSV(){

			Scanner scanner = null;
			try {
				//Get the scanner instance
				scanner = new Scanner(new File("2020-2021 SKUs M&W CSV.csv"));
				//Use Delimiter as COMMA
				scanner.useDelimiter(COMMA_DELIMITER);
				
				while(scanner.hasNext())
				{
				
					System.out.print(scanner.next() + " ");
				//	String SKU = scanner.next();
				//	String ProductTitle	= scanner.next();
				//		designs.add(new Design(ProductTitle, SKU));

				}
			} 
			catch (FileNotFoundException fe) 
			{
				fe.printStackTrace();
			}
			finally
			{
				scanner.close();
			}
			
		}
	
		public static void main(String args[])
		{
			MWProductCsvFiller filler = new MWProductCsvFiller();
			filler.ReadMWSKUsAndNamesCSV();
			
		}
		
	}
	
	

