Sahana Eden – Warehouses module narrative (English)
Introduction

The Warehouses module of the open‑source Sahana Eden platform sits at the heart of humanitarian logistics. A key strength of Sahana Eden is that it lets organizations record their offices, warehouses and field sites and link them to other modules such as human resources, assets and inventory. By combining geographic information with inventory data, Eden helps logisticians answer simple but life‑saving questions: What do we have, where is it stored and how quickly can it move?

Defining your logistics vocabulary

At the beginning of the video we see the user creating warehouse types, catalogs and item categories. This may look bureaucratic, but it is the foundation of a shared logistics vocabulary. In Eden you can define your own warehouse types – central depots, field stores, mobile cold‑chain sites – so that reports and maps show you exactly what resources each facility can handle. Catalogs and categories allow different organizations to share standardized lists of items. The Sahana wiki explains that a catalog is a specific list of physical objects required for disaster management and that each catalog item can have its own category and sub‑category. By setting these up once, teams avoid confusion about units, expiry dates or brands later on, and they can import or export these lists via CSV for rapid scale‑up.

As the video moves to item creation, notice that the user records the unit of measure, model and year of manufacture. Capturing such detail up front pays dividends later: Eden can track the age of a piece of equipment, warn when medical kits are due for replacement and ensure that donors know exactly what was purchased or donated. The platform’s modular design makes this data available throughout the system – inventory, procurement, distribution – without retyping.

Registering suppliers and partners

Next, the video introduces the Supplier form. Maintaining a register of suppliers is more than address book management. In humanitarian operations, supplies often come from a mix of commercial vendors and in‑kind donors. Eden lets you record contact details, websites and even the year of establishment so that procurement teams can see who delivered last time and how to reach them again. Having this information in one place also supports audit trails and donor reporting; the SourceForge description of Eden stresses that it creates databases of organizations and links them to inventory and other modules.

Creating a warehouse – anchoring inventory in space

When the video switches to the Create Warehouse screen, it highlights that a warehouse is more than a name and an address. In logistics terminology, a warehouse is a site where items are stored. Eden prompts you to enter the facility’s code, organization, location (down to the postal code) and capacity in cubic metres. This allows the system to place the warehouse on a GIS map and compare total and free capacity, ensuring that incoming shipments fit. Contact details for the warehouse manager are recorded so that drivers and field teams always know whom to call, and free‑form comments let you note conditions such as “requires 4×4 access” or “cold storage only.”

Receiving shipments – clean digital intake

The Receive Shipment form shown around the three‑minute mark demonstrates Eden’s digital intake process. Each shipment is defined by its type (procurement, donation or internal transfer), its origin and identifiers such as waybill and purchase order numbers. Recording a waybill digitally means there is no risk of paper documents being lost en route. Eden also lets you link a shipment to a specific request (REQ) and to the person who received it. Once you approve the receipt, the items automatically appear in the stock list with their batch numbers and expiry dates – no manual inventory entry is needed.

Sending shipments – chain‑of‑custody on the road

Humanitarian supply chains are not one‑way; goods must travel between central warehouses and forward distribution points. The Send Shipment screen emphasizes this by capturing both origin and destination as well as the driver’s name, phone number and vehicle registration. Sahana’s logistics definitions describe a shipment as a movement of items from one site to another, covering internal transfers, distribution or disposal. By recording the driver and departure time, Eden provides a chain‑of‑custody and enables real‑time tracking. Because the shipment is linked to a request, the system knows which items to allocate and prevents accidental double‑issue. On the receiving side, a simple confirmation updates stock without re‑typing line items.

Making requests – demand driven logistics

The Request (REQ) form captures needs from the field. Here the requester specifies the type of request (e.g., warehouse stock), its purpose, priority and the facility it is needed for. Using a structured form instead of email or telephone ensures that nothing is forgotten and that all requests have a unique number. Once logged, Eden can automatically match requests to available stock in your warehouses and reserve items via commitments, ensuring that high‑priority needs are met first. This transforms logistics from a reactive process to a demand‑driven workflow and reduces the back‑and‑forth that slows down relief efforts.

Committing stock – reserving goods with confidence

Around the five‑minute mark the video shows a Commitment being created. Committing stock reserves specific quantities against a request so that they cannot be issued to someone else. This is particularly valuable when multiple warehouses serve the same region and requests arrive simultaneously. Eden records who made the commitment and when, and it allows you to indicate when the goods will be available for shipment. By formalizing reservations, it eliminates the double‑booking problem that often plagues spreadsheet‑based systems and ensures that promises made to beneficiaries are kept.

Registering distributions – the last mile

The Distribution screen demonstrates how Eden tracks aid to individual recipients. According to the logistics definitions, a distribution occurs when items are handed over to an external site, person or organization. In Eden you select a beneficiary (or household) from the person registry, specify what was given and record the staff member responsible. This data is crucial for donor reporting and for ensuring that aid reaches intended recipients. It also allows you to analyse coverage, avoid duplicate assistance and respect privacy through role‑based access controls.

Stock counts and adjustments – keeping reality in sync

In the final scene the video covers Stock Counts. Periodic inventories are inevitable – losses, damages and theft happen in any warehouse. Eden supports formal stock counts with a simple form that records who performed the count, when and for which warehouse. You can note whether it is a routine inventory or an ad‑hoc investigation and leave comments about discrepancies. When differences are found, Eden uses adjustments rather than direct edits so that every change is auditable. These adjustment records capture the reason (e.g., loss, damage, surplus) and preserve the accountability that donors demand.

Beyond the basics – what else can Eden do?

The video focuses on core processes, but the Warehouses module offers more. Eden’s inventory management supports batch and expiry tracking for perishable goods, and it can automatically alert you when items approach their expiry dates. It allows you to assemble kits (such as hygiene packs) from individual stock items so that field staff can issue a single unit instead of multiple components. Eden’s comprehensive reporting tools can summarize current stock, highlight near‑expiry lots and calculate the monetary value of your inventory. The platform’s open architecture also means that inventory data can be shared between organizations to improve collaboration and operational efficiency. And because Eden is modular and open source, it can grow with your organisation, integrating procurement, HR and project management modules as your needs evolve.

Conclusion

Running humanitarian warehouses with spreadsheets and paper forms is inefficient and risky. Sahana Eden transforms that chaos into a structured, auditable and collaborative process. By defining your logistics vocabulary, registering suppliers and facilities, digitizing receipts and shipments, matching requests to stock and tracking distributions to beneficiaries, Eden gives you a real‑time picture of your supply chain. Its open‑source nature and modular design make it a sustainable choice for organizations of any size. In the words of one overview, Eden’s inventory management provides automated transactions, shipment tracking and monitoring of inventory items, and it allows data to be shared between organisations to boost collaboration and coordination. With these tools, your team can focus on delivering aid where it is needed most – not on hunting through spreadsheets.