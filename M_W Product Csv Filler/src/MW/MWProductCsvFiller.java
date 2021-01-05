package MW;

import java.io.*;
import java.util.Scanner;
import java.util.ArrayList;

public class MWProductCsvFiller {
	public static final String COMMA_DELIMITER = ",";
	private static final String NEWLINE_DELIMITER = "\n";
	public final String[] products = {"12by12Wood","12by16Wood","18by18Wood","18by24Metal","18by24Wood","24by24Wood","9by12Metal","9by12Wood","WoodBookmarker","WoodCoaster","WoodMagnet","Metal Bottle Opener","miniWood Sticker","Wood Ornament","Wood Postcard","Swood Wood Sticker","Wood Luggage Tag"};
	public double[] prices = new double[16];
	public String[] descriptions = new String[16];
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
				scannerPrice = new Scanner(new File("Prices.csv"));
				
				scannerPrice.useDelimiter(NEWLINE_DELIMITER);
				int i = 0;
				
				while(scannerPrice.hasNext())
				{
					
					double price = Double.parseDouble(scannerPrice.nextLine());
					prices[i] = price;

					
				 System.out.println(price);
				 i++;
				}
			} 
			catch (FileNotFoundException fe) 
			{
				fe.printStackTrace();
			}
			finally
			{
				scannerPrice.close();
			}
			
			try {
				//Get the scanner instance
				scannerDescription = new Scanner(new File("Descriptions.csv"));
				int j = 0;
				scannerDescription.useDelimiter(NEWLINE_DELIMITER);
				while(scannerDescription.hasNext())
				{
				// happens to be a simple split down the middle.
					
					String description = scannerDescription.nextLine();
					descriptions[j] = description;

					
					 System.out.println(description);
					 j++;
				}
			} 
			catch (FileNotFoundException fe) 
			{
				fe.printStackTrace();
			}
			finally
			{
				scannerDescription.close();
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
				writer = new PrintWriter(new FileOutputStream("M&W 2020-2021 Website SKUs Sheet TEST"));
			
			for(Design design : designs) {
				for(int i = 0;i<prices.length;i++) {
					design.setPhysicalItem(products[i]);
					design.setSalesPrice(prices[i]);
					design.setMainDesc(descriptions[i]);
					// if i weren't a goon this could be a SICK ternary operator... BRO ITD BE SO COOL
					// - every shitty programmer ever
					String groupID;
					if(design.getSKUs().contains("-")) {
						int end = design.getSKUs().indexOf("-");
						groupID = design.getSKUs().substring(0, end);
					} else {
						groupID = design.getSKUs();
					}
					design.setGroupID(groupID);
					design.setSalesDesc(design.getProductTitle() +" "+ products[i]);
					
					//TODO Merge Design name name with Product Name 
					writer.println(design.toString());
				}
				
			}
				
				
				
				
			} catch (FileNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		
			
			
			finally {
				writer.close();
			}
		}
		
		
		
		
		
	}
	
	

