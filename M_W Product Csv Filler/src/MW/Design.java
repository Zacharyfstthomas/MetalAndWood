package MW;

import java.util.ArrayList;
import java.util.Arrays;

public class Design {
	
	private ArrayList<Product> products;
	public static ArrayList<String> ProductNames; //= new ArrayList<String>(Arrays.asList("12by12Wood","12by16Wood","18by18Wood","18by24Metal","18by24Wood","24by24Wood","9by12Metal","9by12Wood","WoodBookmarker","WoodCoaster","WoodMagnet","Metal Bottle Opener","miniWood Sticker","Wood Ornament","Wood Postcard","Swood Wood Sticker","Wood Luggage Tag","Wood Pin appx 1-2",
		//	"Wood Pin appx 1-1.5",
	//		"Wood Keychain",
		/*	"Mini Wood Magnet Starter Set",
			"Mini Swood Wood Sticker Starter Set",
			"2X8\" Hanging Wood Art Print",
			"4X16\" Hanging Wood Art Print",
			"6X24\" Hanging Wood Art Print",
			"8X32\" Hanging Wood Art Print",
			"3X3 Block Wood Art Print",
			"7X7 Block Wood Art Print",
			"4X6 Block Wood Art Print",
			"5X7 Block Wood Art Print",
			"6.5X9 Block Wood Art Print",
			"12X12 Block Wood Art Print",
			"18X18 Block Wood Art Print",
			"24X24 Block Wood Art Print",
			"9X12Block Wood Art Print",
			"12X16 Block Wood Art Print",
			"18X24 Block Wood Art Print",
			"6X30 Wood Art Print",
			"6X30 Alum Art Print"
));*/
	private String ProductTitle;
	private String GroupID;
	private String ReadSKUs;
	private String WriteSKUs;
	private String PhysicalItem;
	private String DesignDescription;
	
	public Design(String ProductTitle, String SKUs) {
		
		this.ProductTitle = ProductTitle;
		this.ReadSKUs = SKUs;
		generateProductsForDesign();
		
	}
	


	private void generateProductsForDesign() {
		for(String name : ProductNames) {
			products.add(new Product(name));
		}
		
	}

	public String getWriteSKUs() {
		return WriteSKUs;
	}

	public void setWriteSKUs(String writeSKUs) {
		WriteSKUs = writeSKUs;
	}

	public String getProductTitle() {
		return ProductTitle;
	}

	public String getReadSKUs() {
		return ReadSKUs;
	}

	public void setProductTitle(String productTitle) {
		ProductTitle = productTitle;
	}

	public void setGroupID(String groupID) {
		GroupID = groupID;
	}

	public void setSKUs(String sKUs) {
		ReadSKUs = sKUs;
	}

	public void setSalesPrice(double salesPrice) {
		SalesPrice = salesPrice;
	}

	public void setSalesDesc(String salesDesc) {
		SalesDesc = salesDesc;
	}

	public void setPhysicalItem(String physicalItem) {
		PhysicalItem = physicalItem;
	}

	public void setMainDesc(String mainDesc) {
		MainDesc = mainDesc;
	} 
	
	 public String toString() {
		 
		 return ProductTitle + "," + GroupID + "," + WriteSKUs + "," + SalesPrice + "," +SalesDesc + "," +  PhysicalItem+ "," + MainDesc;
	 }

	
	
}
