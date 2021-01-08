package MW;

import java.io.*;
import java.util.Scanner;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

import java.util.ArrayList;
import java.util.Arrays;

//potential improvements:
// read from the file mike provides.

public class MWProductCsvFiller {
	public static final String COMMA_DELIMITER = ",";
	private static final String NEWLINE_DELIMITER = "\n";
	//first two arraylists should be replaced with a class TODO
	//public final String[] products = {"12by12Wood","12by16Wood","18by18Wood","18by24Metal","18by24Wood","24by24Wood","9by12Metal","9by12Wood","WoodBookmarker","WoodCoaster","WoodMagnet","Metal Bottle Opener","miniWood Sticker","Wood Ornament","Wood Postcard","Swood Wood Sticker","Wood Luggage Tag"};
	//public String[] ProductAbbrev = {"-1212W","-1216W","-1818W","-1824M","-1824W","-2424W","-912M","-COAST","-MAG","-MBC","-MSWD","-ORN","-POST","-SWD","-TAG","-BMKR"};
	//public double[] prices = new double[16];
//	public String[] descriptions = new String[16];
	public ArrayList<Design> designs;
		//Delimiters used in the CSV file
			
		public MWProductCsvFiller() {
			designs = new ArrayList<Design>(); 
		}	
		
		public void ReadMWSKUsAndNamesCSV(){

			Scanner scannerSKUS = null;
			Scanner scannerPrice = null;
			Scanner scannerDescription = null;
			try {
				//Get the scanner instance
				scannerSKUS = new Scanner(new File("2020-2021 SKUs M&W CSV.csv"));
				
				
				while(scannerSKUS.hasNext())
				{
				// happens to be a simple split down the middle.
					
					String line = scannerSKUS.nextLine();
					String[] entries = line.split(",");
					String SKU = entries[0];
					String ProductTitle = entries[1];
					

					
				 System.out.println(SKU + " " + ProductTitle);
				this.designs.add(new Design(ProductTitle, SKU));
				}
			} 
			catch (FileNotFoundException fe) 
			{
				fe.printStackTrace();
			}
			finally
			{
				scannerSKUS.close();
			}
			
			try {
				//Get the scanner instance
				CSVReader csvReader = new CSVReader(new FileReader("Multiples MetalandWoodinfo.csv"));
				
				ArrayList<String> readedLine; // line that will be read by openCSV
				
				while((readedLine = new ArrayList<String>(Arrays.asList(csvReader.readNext()))) != null) {
					for(String cell : readedLine) {
						switch (readedLine.indexOf(cell)) {
						// do something different for each collumn
						
						}
						
						
					}
				}
				
			
			
				}
			catch (FileNotFoundException fe) 
			{
				fe.printStackTrace();
			} catch (CsvValidationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			finally
			{
				scannerPrice.close();
			}
		}
			
		
		
		
		//read constants? Likely to be more efficent. Already proven fairly easy. Can literally be added to the csv.
		
		//public void addToDesignsSetConstants
	
		public static void main(String args[])
		{
			MWProductCsvFiller filler = new MWProductCsvFiller();
			filler.ReadMWSKUsAndNamesCSV();
			System.out.println(filler.designs.size());
			filler.writeMWSKUsAndNamesCSV();
			
		}

		private void writeMWSKUsAndNamesCSV() {
			// TODO Auto-generated method stub
			PrintWriter writer = null;
			try {
				writer = new PrintWriter(new FileOutputStream("M&W 2020-2021 Website SKUs Sheet TEST.csv"));
			
			for(Design design : designs) {
					design.setPhysicalItem(products[i]);
					design.setSalesPrice(prices[i]);
					design.setMainDesc(descriptions[i]);
					// if i weren't a goon this could be a SICK ternary operator... BRO ITD BE SO COOL
					// - every shitty programmer ever
					String groupID;
					if(design.getReadSKUs().contains("-")) {
						int end = design.getReadSKUs().indexOf("-");
						groupID = design.getReadSKUs().substring(0, end);
					} else {
						groupID = design.getReadSKUs();
					}
					design.setGroupID(groupID);
					design.setSalesDesc(design.getProductTitle() +" "+ products[i]);
					design.setWriteSKUs(design.getReadSKUs() + ProductAbbrev[i]);
					//TODO Merge Design name name with Product Name 
					writer.println(design.toString());
				}
				
			}
				
				
				
				
			 catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		
			
			
			finally {
				writer.close();
			}
		}
		
		
		
		
		
	}
	
	

