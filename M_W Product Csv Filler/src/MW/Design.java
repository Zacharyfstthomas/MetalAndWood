package MW;

public class Design {
	
	final String[] Items = {"12by12Wood","12by16Wood","18by18Wood","18by24Metal","18by24Wood","24by24Wood","9by12Metal","9by12Wood","WoodBookmarker","WoodCoaster","WoodMagnet","Metal Bottle Opener","miniWood Sticker","Wood Ornament","Wood Postcard","Swood Wood Sticker","Wood Luggage Tag"};
	String ProductTitle;
	String GroupID;
	String SKUs;
	double SalesPrice;
	String SalesDesc;
	String PhysicalItem;
	String MainDesc;
	
	public Design(String ProductTitle, String SKUs) {
		
		this.ProductTitle = ProductTitle;
		this.SKUs = SKUs;
		
	}

	public void setProductTitle(String productTitle) {
		ProductTitle = productTitle;
	}

	public void setGroupID(String groupID) {
		GroupID = groupID;
	}

	public void setSKUs(String sKUs) {
		SKUs = sKUs;
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
	
	

	
	
}
