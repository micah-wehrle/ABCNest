import { Pokemon } from "./pokemon.model";

export class TechLoad {

  public  jobs: JobData[];
  private jobCount: number;
  private uuid: string;

  private seed: number;
  private seedIndex: number = 0; // doesn't really matter what it's instantiated to, just needs to be any number >= 0 so the seed methods can generate the next number

  constructor(uuid: string, amount?: number) { // Can be built with a given amount, but if not will seed the number of jobs to build
    this.uuid = uuid;
    // uses abs as ensure the seed is positive. convertStrToNum sometimes returns a negative value, and the seed increments positively so must start >= 0 or else may create predictable seeded number (i.e. 0 * anything is always 0)
    this.seed = Math.abs(this.convertStrToNum(uuid));
    
    this.jobs = [];
    // generate a random number of jobs, weighted towards ~3
    const generatedJobCount: number = Math.round( (this.nextRand()*7 + this.nextRand()*7) / 2 );  // This line needs to run regardless of if we were passed an amount, or else the seeded rng will get messed up!
    this.jobCount = amount ? amount : generatedJobCount; // allows for front end to request a specific number of jobs. If amount is not present, use the above generated number
    for (let i = 0; i < this.jobCount; i++) {
      this.jobs.push(this.generateJob()); // Where all the "magic" happens, generateJob will create all job data and push it into job array
    }
  }

  /**
   * @description - Called by constructor to generate a job. 
   * @returns {JobData} - Returns an object which contains the entirety of job data required to fill out a fake ticket
   */
  private generateJob(): JobData {
    // The following variables are generated prior to the output object, as they are passed into generator methods in order to generate data consistent throughout the ticket
    const firstName: string = this.generateFirstName();
    const lastName: string = this.generateLastName();
    const streetAddress: string = this.generateStreetAddress();
    const jobType: string = this.randOf<string>(['Install', 'Repair', 'Helper', 'POTS', 'BSW']);
    const transportType: string = jobType === 'POTS' || this.nextRand() < 0.5 ? this.randOf<string>(['IP-CO', 'IP-RT', 'FTTN', 'FTTN-BP']) : this.randOf<string>(['FTTP GPON', 'FTTP XGS-PON']);
    const curJob: JobData = {
      firstName,
      lastName,
      accountNumber: this.randDigits(7),
      location: {
        zip: this.randDigits(5),
        ...this.generateCityLocation(streetAddress)
      },
      appointment: this.generateAppointment(),
      email: this.generateEmail(firstName, lastName),
      phone: this.randDigits(10),
      history: this.generateHistory(),
      jobType,
      transportType,
      facilities: this.generateFacilities(transportType, streetAddress),
      services: this.generateServices(transportType),
      pokemon: this.generatePokemon()
    };

    return curJob;
  }

  /**
   * @description Found online. Converts a string to a unique number for seed generation.
   * @param {string} str The string to convert
   * @returns {number} the string converted to a unique number
   */
  private convertStrToNum(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i); // essentially convert the number to binary, shift the bits over 5 places, and add the new number
    }
    return hash;
  }

  /* * * * * * * * * * * * * * * * * * * * * * */
  //          Seeded Methods
  /* * * * * * * * * * * * * * * * * * * * * * */

  /**
   * @description Will generate the next number in the seed from the sequence, by incrementing the seed index and executing a prime number-based formula to produce a pseudorandom number.
   * @returns {number} The next pseudorandom number produced from the seed, between 0 and 1 
   */
   private nextRand(): number {
    this.seedIndex++;
    let a = (this.seed + this.seedIndex) * 15485863; // primes and formula taken from https://en.wikipedia.org/wiki/Pseudorandom_number_generator#Implementation
    return (a * a * a % 2038074743) / 2038074743;
  }

  /**
   * @description Will return a random element of the given array based off of the global seeded random number generator
   * @param {T[]} options An array of possible options to pseudo-randomly choose from 
   * @returns {string} A pseudo-randomly selected element from the array
   */
   private randOf<T>(options: T[]): T {
    return options[Math.floor(this.nextRand() * options.length)];
  }

  /**
   * @description Generates a random number with a guaranteed number of digits based on given inputs
   * @param {number} lowDigits - (inclusive) The lower bounds for the number of digits in the generated number. When passed as the only variable will set the exact length of the number
   * @param {number} highDigits? - (exclusive) When a value is given will set the upper bounds for the number of digits in the generated number
   * @returns {number} - The randomly generated number from the seed which has a number of digits between lowDigits and highDigits
   */
  private randDigits(lowDigits: number, highDigits?: number): number {
    let output: number;
    let digits: number;
    if (!highDigits) {
      digits = lowDigits;
      output = Math.floor(this.nextRand() * (10 ** lowDigits));
    }
    else {
      digits = Math.floor(this.nextRand() * (highDigits-lowDigits)) + lowDigits; // pick a random number between highDigits and lowDigits
      output = Math.floor(this.nextRand() * Math.pow(10, digits));
    }

    while (output < 10 ** (digits-1)) { // add trailing zeroes if a number was picked that originally had leading zeroes (which would be removed automatically). For example, a 4 digit number might be 0025. This would automatically become 25, but this loop will make it 2500 meeting the 4 digit criteria.
      output *= 10;
    }

    return output;
  }

  /**
   * @description Generate a seeded email.
   * @param {string} first The user's first name
   * @param {string} last The user's last name
   * @returns {string} The finished email
   */
  private generateEmail(first: string, last: string): string {
    const domains: string[] = ['gmail', 'aol', 'adelphia', 'yahoo', 'bell', 'att', 'microsoft', 'outlook'];
    const topLevel: string[] = ['com', 'net', 'gov', 'co.uk', 'org', 'edu'];

    let email = '';
    email += this.nextRand() < 0.1 ? `${this.randOf<string>(['the', 'super', 'dr', 'smiling'])}.` : '';
    email += this.nextRand() < 0.5 ? first.charAt(0) : first; // Add first name
    email += this.nextRand() < 0.5 ? '.' : '_'; // Add first/last spacer
    email += last; 
    email += this.nextRand() < 0.2 ? `.${this.randOf<string>(['inc', 'worldwide', 'sports'])}` : '';
    email += this.nextRand() < 0.5 ? this.randDigits(2,4) : ''; // Add some amount of numbers
    email += `@${this.randOf<string>(domains)}.${this.randOf<string>(topLevel)}`; // add @ and domain
    return email;
  }

  /**
   * @description - Picks a random appointment window from an array of potential windows using a seed
   * @returns {string} - The seeded randomly chosen appointment window
   */
  private generateAppointment(): string {
    return this.randOf<string>(['8-10', '10-12', '8-12', '8-8', '12-2', '2-4', '12-4', '4-8']);
  }

  /**
   * @description - Generates a seeded random street address including house number, street name, and street type (Rd, St, etc)
   * @returns {string} - The generated street address
   */
  private generateStreetAddress(): string {
    const streetNames: string[] = ['Main', 'Church', 'High', 'Elm', 'Park', 'Walnut', 'Washington', '2nd', 'Chestnut', 'Broad', 'Maple', 'Oak', 'Maple', 'Center', 'Pine', 'River', 'Market', 'Washington', 'Water', 'Union', '3rd', 'South', '4th'];
    const streetTypes: string[] = ['St', 'Ln', 'Ave', 'Dr', 'Blvd', 'Park', 'Rd'];

    return `${this.randDigits(3,6)} ${this.randOf<string>(streetNames)} ${this.randOf<string>(streetTypes)}`;
  }

  /**
   * @description Generates a seeded random facility address. If given a street address as a parameter, will use that as the base, otherwise will generate its own street address
   * @param {string} streetAddress? - If included, will use as the base address, otherwise will generate its own
   * @returns {string} - The generated address
   */
  private generateFacilityAddress(streetAddress?: string): string {
    const locationPrefix: string[] = ['F', 'S', 'R', 'B'];

    return `${this.randOf<string>(locationPrefix)} ${!streetAddress ? this.generateStreetAddress() : streetAddress}`;
  }

  /**
   * @description Generates an address that has the same street name as the given street address, but will pick a number near to the given house number.
   * @param {string} streetAddress The street address to use as a base for the output
   * @returns {string} The generated address which could be a nearby location to the given streetAddress parameter
   */
  private convertToNearbyFacilityAddress(streetAddress: string): string {
    const addressSplit: string[] = streetAddress.split(' ');
    const addressNum: number = +addressSplit.shift();

    const newAddress = `${addressNum + ( Math.floor(this.nextRand()*5)-2) * (Math.floor(this.nextRand()*6) )} ${addressSplit.join(' ')}`;

    return this.generateFacilityAddress(newAddress); // add prefix
  }
  
  /**
   * @description Generates an array of history entries
   * @returns {History[]} An array of seeded random history entries with fake data. 
   */
  private generateHistory(): History[] {
    const historyEntries: History[] = [];
    const historyEntryCount: number = Math.floor(this.nextRand() * 7) + 3;
    let lastDate = (new Date()).getTime() - 1000*3600*24; // minus one day so it was "yesterday". Technically won't be consistent between days, could always pick a random date in the past so it's fully procedural.

    for (let i = 0; i < historyEntryCount; i++) {
      const historyEntryTitle: string = this.randOf<string>(['Interaction', 'Dispatch', 'Case']);
      lastDate -= Math.floor(this.nextRand() * 7) * 1000*3600*24; // subtract 0-7 days from last time
      
      const curHistoryEntryInfo: string[] = [];
      let interactionType: number;
      switch (historyEntryTitle) {
        case 'Interaction':
          interactionType = Math.floor(this.nextRand()*3);
          curHistoryEntryInfo.push(`Title: ${['Customer Called', 'Customer Chatted', 'Contacted Customer'][interactionType]}`);
          curHistoryEntryInfo.push(`Interaction Notes: ${['Customer wanted to check on status of bill.', 'Customer wanted to upgrade speed profile. Informed of charges.', 'Notified customer of outstanding account balance.'][interactionType]}`);
          break;
        case 'Dispatch':
          curHistoryEntryInfo.push(`Status: ${this.randOf<string>(['COMPLETE', 'RETURNED', 'PENDING'])}`);
          curHistoryEntryInfo.push(`Dispatch Type: ${this.randOf<string>(['IEFS', 'TFS', 'LMNO', 'MachOp', 'MachOke', 'MachAmp'])}`);
          curHistoryEntryInfo.push(`Tech Notes: ${this.uuid ? this.uuid : 'tr99aa'}; ${this.randOf<string>(['Worked on hsia. Probably wont be in service long but fingers crossed.', 'Lots of work done but will come back later to completely complete work.', 'Customer asked me if I always dressed like this. I said yes. I always do, I only have one uniform. I mean I have multiple uniforms, but they all look the same. I asked why they asked. They just said they were curious. I left.'])}`);
          break;
        case 'Case':
          let minutes: string = ''+Math.floor(this.nextRand()*60);
          if (minutes.length === 1) {
            minutes = `0${minutes}`;
          }
          curHistoryEntryInfo.push(`Case Creation Time: ${Math.ceil(this.nextRand()*12)}:${minutes} ${this.nextRand() < 0.5 ? 'A':'P'}M`);
          curHistoryEntryInfo.push(`Case Status: ${this.nextRand() < 0.2 ? 'OPEN' : 'CLOSED'}`);
          curHistoryEntryInfo.push(`Notes: ${this.randOf<string>(['Customer wanted to verify if they did in fact have service with us. They do. Informed customer.', 'Customer\'s internet is not working. Followed troubleshooting flow. Customer had cell phone upside down.', 'Customer is wondering why this entry type would be any different than Interaction entries, but idk I just whipped this up so we will roll with it.'])}`);
          break;
      }

      const historyDate = new Date(lastDate);
      historyEntries.push({
        title: historyEntryTitle,
        date: `${historyDate.getMonth()+1}/${historyDate.getDate()}/${historyDate.getFullYear()}`,
        info: curHistoryEntryInfo
      });
    }
    return historyEntries;
  }

  /**
   * @TODO Test change to facility count
   * @description - Generates an array of facilities info. Titles each facility element based on whether the transport type is fiber or not, and will select a random number of facilities for copper.
   * @param {string} transportType - The transport type for the ticket, really only matters for copper vs fiber
   * @param {string} cxAddress - The customer's address. Will be used for the last facility entry and for creating a potentially nearby terminal address.
   * @returns {Facility[]} - The generated array of facility data.
   */
  private generateFacilities(transportType: string, cxAddress: string): Facility[] {
    let facilitiesOutput: Facility[] = [];
    const isFiber: boolean = transportType.substring(0,4) === 'FTTP';
    const fiberFacilitiesHeadings = ['PFP', 'CFST', 'Prem'];
    const facilitiesCount = isFiber ? 3 : Math.floor((this.nextRand()*6 + this.nextRand()*6 + this.nextRand()*6) / 3) + 1;
    
    for (let i = 0; i < facilitiesCount; i++) {
      facilitiesOutput.push({
        heading: isFiber || i === facilitiesCount-1 ? fiberFacilitiesHeadings[i] : `F${i+1}`,
        address: i === facilitiesCount - 1 ? cxAddress : i === facilitiesCount - 2 ? this.convertToNearbyFacilityAddress(cxAddress) : this.generateFacilityAddress(),
        ...(i !== facilitiesCount - 1 ? { // Only add this data if we're not on the last facility (prem)
          cable: Math.ceil(this.nextRand() * (i === 0 ? 24 : 144)),
          pair: Math.ceil(this.nextRand() * (i === 0 ? 32 : 144)),
          port: Math.ceil(this.nextRand() * (i === 0 ? 800 : 12))
        } : {})
      });
    }

    return facilitiesOutput;
  }

  /**
   * @description - Will generate all services for the current ticket based on the transport type. Will randomly decide to include internet, voip, uverse, etc.
   * @param {string} transportType - The current transport type, do determine internet speeds.
   * @returns {Services} - The services for the ticket bundled into a single object
   */
  private generateServices(transportType: string): Services {
    const isFiber = transportType.match(/FTTP/i);
    const has010 = isFiber && this.nextRand() < 0.4;
    const services: Services = {
      equipment: [ isFiber ? (has010 ? '010 Jack' : 'Slimline Jack') : 'AB Jack' ]
    };
    if (isFiber) { // Add ont for fiber
      services.equipment.push(`${services.equipment[0].match(/slim/i) ? 'i' : ''}ONT: -${Math.floor(this.nextRand()*10)+15}.${Math.floor(this.nextRand()*1000)}dbm`);
    }
    services.equipment.push(isFiber && !has010 ? '320' : this.randOf<string>(['210', '5268', '599', '589']));

    if (this.nextRand() < 0.15) { // add uverse 
      services.uversePackage = this.randOf<string>(['U100', 'U200', 'U300']); // Micah doesn't really know uverse stuff too well. Feel free to adjust any uverse arrays below!
      const uverseBoxCount = Math.floor( (this.nextRand()*6 + this.nextRand()*6) / 2);
      services.equipment.push(this.randOf<string>(['2262v2', '9001', '2200']));
      for (let i = 0; i < uverseBoxCount; i++) {
        services.equipment.push(this.randOf<string>(['2500', '7005', '1200']));
      }
    }

    if (this.nextRand() < 0.99) { // almost always have internet
      let availableSpeeds: number[];
      if (isFiber) {
        availableSpeeds = [1000, 500, 300, 100];
        if (transportType.match(/XGS/i)) {
          availableSpeeds.push(5000);
          availableSpeeds.push(2000);
        }
      }
      else if (transportType.match(/IP/i)) {
        availableSpeeds = [1, 2, 5, 10];
      }
      else {
        availableSpeeds = [10, 15, 25];
        if (transportType.match(/BP/i)) {
          availableSpeeds.push(50);
          availableSpeeds.push(100);
        }
      }
      services.internetSpeed = this.randOf<number>(availableSpeeds);
    }

    if (this.nextRand() < 0.05) { // Add pots
      services.potsNumber = this.randDigits(10);
    }
    else if (this.nextRand() < 0.2) { // Add voip
      services.voipNumbers = [this.randDigits(10)];
      if (this.nextRand() < 0.01) {
        services.voipNumbers.push(this.randDigits(10));
      }
    }

    return services;
  }

  /**
   * @TODO make sure single-line location string works
   * @description - Randomly draws location data from a mini database of locations. Is just all 50 state capitals and their lat/long coordinates.
   * @param {string} streetAddress - The customer's street address, to be included in the city location data.
   * @returns {Location} - The generated city data, which includes the street address, city and state names, and lat/long coordinates.
   */
  private generateCityLocation(streetAddress: string): Location {
    const locations = `AL,Montgomery,32.377716,-86.300568;AK,Juneau,58.301598,-134.420212;AZ,Phoenix,33.448143,-112.096962;AR,Little Rock,34.746613,-92.288986;CA,Sacramento,38.576668,-121.493629;CO,Denver,39.739227,-104.984856;CT,Hartford,41.764046,-72.682198;DE,Dover,39.157307,-75.519722;HI,Honolulu,21.307442,-157.857376;FL,Tallahassee,30.438118,-84.281296;GA,Atlanta,33.749027,-84.388229;ID,Boise,43.617775,-116.199722;IL,Springfield,39.798363,-89.654961;IN,Indianapolis,39.768623,-86.162643;IA,Des Moines,41.591087,-93.603729;KS,Topeka,39.048191,-95.677956;KY,Frankfort,38.186722,-84.875374;LA,Baton Rouge,30.457069,-91.187393;ME,Augusta,44.307167,-69.781693;MD,Annapolis,38.978764,-76.490936;MA,Boston,42.358162,-71.063698;MI,Lansing,42.733635,-84.555328;MN,St. Paul,44.955097,-93.102211;MS,Jackson,32.303848,-90.182106;MO,Jefferson City,38.579201,-92.172935;MT,Helena,46.585709,-112.018417;NE,Lincoln,40.808075,-96.699654;NV,Carson City,39.163914,-119.766121;NH,Concord,43.206898,-71.537994;NJ,Trenton,40.220596,-74.769913;NM,Santa Fe,35.68224,-105.939728;NC,Raleigh,35.78043,-78.639099;ND,Bismarck,46.82085,-100.783318;NY,Albany,42.652843,-73.757874;OH,Columbus,39.961346,-82.999069;OK,Oklahoma City,35.492207,-97.503342;OR,Salem,44.938461,-123.030403;PA,Harrisburg,40.264378,-76.883598;RI,Providence,41.830914,-71.414963;SC,Columbia,34.000343,-81.033211;SD,Pierre,44.367031,-100.346405;TN,Nashville,36.16581,-86.784241;TX,Austin,30.27467,-97.740349;UT,Salt Lake City,40.777477,-111.888237;VT,Montpelier,44.262436,-72.580536;VA,Richmond,37.538857,-77.43364;WA,Olympia,47.035805,-122.905014;WV,Charleston,38.336246,-81.612328;WI,Madison,43.074684,-89.384445;WY,Cheyenne,41.140259,-104.820236`
      .split(';').map((el: string): Location => { // kinda gross, but this basically converts the above string into an array of Location objects
        const parts = el.split(',');
        return {
          streetAddress, 
          state: parts[0], 
          city: parts[1], 
          lat: +parts[2], 
          long: +parts[3]
        };
      });
    return this.randOf<Location>(locations);
  }

  /**
   * @description - Generates a random human first name. Just has a long string of names and picks one randomly.
   * @returns {string} - The chosen first name.
   */
  private generateFirstName(): string {
    return this.randOf<string>(`Michael,Christopher,Jessica,Matthew,Ashley,Jennifer,Joshua,Amanda,Daniel,David,James,Robert,John,Joseph,Andrew,Ryan,Brandon,Jason,Justin,Sarah,William,Jonathan,Stephanie,Brian,Nicole,Nicholas,Anthony,Heather,Eric,Elizabeth,Adam,Megan,Melissa,Kevin,Steven,Thomas,Timothy,Christina,Kyle,Rachel,Laura,Lauren,Amber,Brittany,Danielle,Richard,Kimberly,Jeffrey,Amy,Crystal,Michelle,Tiffany,Jeremy,Benjamin,Mark,Emily,Aaron,Charles,Rebecca,Jacob,Stephen,Patrick,Sean,Erin,Zachary,Jamie,Kelly,Samantha,Nathan,Sara,Dustin,Paul,Angela,Tyler,Scott,Katherine,Andrea,Gregory,Erica,Mary,Travis,Lisa,Kenneth,Bryan,Lindsey,Kristen,Jose,Alexander,Jesse,Katie,Lindsay,Shannon,Vanessa,Courtney,Christine,Alicia,Cody,Allison,Bradley,Samuel,Shawn,April,Derek,Kathryn,Kristin,Chad,Jenna,Tara,Maria,Krystal,Jared,Anna,Edward,Julie,Peter,Holly,Marcus,Kristina,Natalie,Jordan,Victoria,Jacqueline,Corey,Keith,Monica,Juan,Donald,Cassandra,Meghan,Joel,Shane,Phillip,Patricia,Brett,Ronald,Catherine,George,Antonio,Cynthia,Stacy,Kathleen,Raymond,Carlos,Brandi,Douglas,Nathaniel,Ian,Craig,Brandy,Alex,Valerie,Veronica,Cory,Whitney,Gary,Derrick,Philip,Luis,Diana,Chelsea,Leslie,Caitlin,Leah,Natasha,Erika,Casey,Latoya,Erik,Dana,Victor,Brent,Dominique,Frank,Brittney,Evan,Gabriel,Julia,Candice,Karen,Melanie,Adrian,Stacey,Margaret,Sheena,Wesley,Vincent,Alexandra,Katrina,Bethany,Nichole,Larry,Jeffery,Curtis,Carrie,Todd,Blake,Christian,Randy,Dennis,Alison,Trevor,Seth,Kara,Joanna,Rachael,Luke,Felicia,Brooke,Austin,Candace,Jasmine,Jesus,Alan,Susan,Sandra,Tracy,Kayla,Nancy,Tina,Krystle,Russell,Jeremiah,Carl,Miguel,Tony,Alexis,Gina,Jillian,Pamela,Mitchell,Hannah,Renee,Denise,Molly,Jerry,Misty,Mario,Johnathan,Jaclyn,Brenda,Terry,Lacey,Shaun,Devin,Heidi,Troy,Lucas,Desiree,Jorge,Andre,Morgan,Drew,Sabrina,Miranda,Alyssa,Alisha,Teresa,Johnny,Meagan,Allen,Krista,Marc,Tabitha,Lance,Ricardo,Martin,Chase,Theresa,Melinda,Monique,Tanya,Linda,Kristopher,Bobby,Caleb,Ashlee,Kelli,Henry,Garrett,Mallory,Jill,Jonathon,Kristy,Anne,Francisco,Danny,Robin,Lee,Tamara,Manuel,Meredith,Colleen,Lawrence,Christy,Ricky,Randall,Marissa,Ross,Mathew,Jimmy,Abigail,Kendra,Carolyn,Billy,Deanna,Jenny,Jon,Albert,Taylor,Lori,Rebekah,Cameron,Ebony,Wendy,Angel,Micheal,Kristi,Caroline,Colin,Dawn,Kari,Clayton,Arthur,Roger,Roberto,Priscilla,Darren,Kelsey,Clinton,Walter,Louis,Barbara,Isaac,Cassie,Grant,Cristina,Tonya,Rodney,Bridget,Joe,Cindy,Oscar,Willie,Maurice,Jaime,Angelica,Sharon,Julian,Jack,Jay,Calvin,Marie,Hector,Kate,Adrienne,Tasha,Michele,Ana,Stefanie,Cara,Alejandro,Ruben,Gerald,Audrey,Kristine,Ann,Shana,Javier,Katelyn,Brianna,Bruce,Deborah,Claudia,Carla,Wayne,Roy,Virginia,Haley,Brendan,Janelle,Jacquelyn,Beth,Edwin,Dylan,Dominic,Latasha,Darrell,Geoffrey,Savannah,Reginald,Carly,Fernando,Ashleigh,Aimee,Regina,Mandy,Sergio,Rafael,Pedro,Janet,Kaitlin,Frederick,Cheryl,Autumn,Tyrone,Martha,Omar,Lydia,Jerome,Theodore,Abby,Neil,Shawna,Sierra,Nina,Tammy,Nikki,Terrance,Donna,Claire,Cole,Trisha,Bonnie,Diane,Summer,Carmen,Mayra,Jermaine,Eddie,Micah,Marvin,Levi,Emmanuel,Brad,Taryn,Toni,Jessie,Evelyn,Darryl,Ronnie,Joy,Adriana,Ruth,Mindy,Spencer,Noah,Raul,Suzanne,Sophia,Dale,Jodi,Christie,Raquel,Naomi,Kellie,Ernest,Jake,Grace,Tristan,Shanna,Hilary,Eduardo,Ivan,Hillary,Yolanda,Alberto,Andres,Olivia,Armando,Paula,Amelia,Sheila,Rosa,Robyn,Kurt,Dane,Glenn,Nicolas,Gloria,Eugene,Logan,Steve,Ramon,Bryce,Tommy,Preston,Keri,Devon,Alana,Marisa,Melody,Rose,Barry,Marco,Karl,Daisy,Leonard,Randi,Maggie,Charlotte,Emma,Terrence,Justine,Britney,Lacy,Jeanette,Francis,Tyson,Elise,Sylvia,Rachelle,Stanley,Debra,Brady,Charity,Hope,Melvin,Johanna,Karla,Jarrod,Charlene,Gabrielle,Cesar,Clifford,Byron,Terrell,Sonia,Julio,Stacie,Shelby,Shelly,Edgar,Roxanne,Dwayne,Kaitlyn,Kasey,Jocelyn,Alexandria,Harold,Esther,Kerri,Ellen,Abraham,Cedric,Carol,Katharine,Shauna,Frances,Antoine,Tabatha,Annie,Erick,Alissa,Sherry,Chelsey,Franklin,Branden,Helen,Traci,Lorenzo,Dean,Sonya,Briana,Angelina,Trista,Bianca,Leticia,Tia,Kristie,Stuart,Laurie,Harry,Leigh,Elisabeth,Alfredo,Aubrey,Ray,Arturo,Joey,Kelley,Max,Andy,Latisha,Johnathon,India,Eva,Ralph,Yvonne,Warren,Kirsten,Miriam,Kelvin,Lorena,Staci,Anita,Rene,Cortney,Orlando,Carissa,Jade,Camille,Leon,Paige,Marcos,Elena,Brianne,Dorothy,Marshall,Daryl,Colby,Terri,Gabriela,Brock,Gerardo,Jane,Nelson,Tamika,Alvin,Chasity,Trent,Jana,Enrique,Tracey,Antoinette,Jami,Earl,Gilbert,Damien,Janice,Christa,Tessa,Kirk,Yvette,Elijah,Howard,Elisa,Desmond,Clarence,Alfred,Darnell,Breanna,Kerry,Nickolas,Maureen,Karina,Roderick,Rochelle,Rhonda,Keisha,Irene,Ethan,Alice,Allyson,Hayley,Trenton,Beau,Elaine,Demetrius,Cecilia,Annette,Brandie,Katy,Tricia,Bernard,Wade,Chance,Bryant,Zachery,Clifton,Julianne,Angelo,Elyse,Lyndsey,Clarissa,Meaghan,Tanisha,Ernesto,Isaiah,Xavier,Clint,Jamal,Kathy,Salvador,Jena,Marisol,Darius,Guadalupe,Chris,Patrice,Jenifer,Lynn,Landon,Brenton,Sandy,Jasmin,Ariel,Sasha,Juanita,Israel,Ericka,Quentin,Jayme,Damon,Heath,Kira,Ruby,Rita,Tiara,Jackie,Jennie,Collin,Lakeisha,Kenny,Norman,Leanne,Hollie,Destiny,Shelley,Amie,Callie,Hunter,Duane,Sally,Serena,Lesley,Connie,Dallas,Simon,Neal,Laurel,Eileen,Lewis,Bobbie,Faith,Brittani,Shayla,Eli,Judith,Terence,Ciara,Charlie,Alyson,Vernon,Alma,Quinton,Nora,Lillian,Leroy,Joyce,Chrystal,Marquita,Lamar,Ashlie,Kent,Emanuel,Joanne,Gavin,Yesenia,Perry,Marilyn,Graham,Constance,Lena,Allan,Juliana,Jayson,Shari,Nadia,Tanner,Isabel,Becky,Rudy,Blair,Christen,Rosemary,Marlon,Glen,Genevieve,Damian,Michaela,Shayna,Marquis,Fredrick,Celeste,Bret,Betty,Kurtis,Rickey,Dwight,Rory,Mia,Josiah,Norma,Bridgette,Shirley,Sherri,Noelle,Chantel,Alisa,Zachariah,Jody,Christin,Julius,Gordon,Latonya,Lara,Lucy,Jarrett,Elisha,Deandre,Audra,Beverly,Felix,Alejandra,Nolan,Tiffani,Lonnie,Don,Darlene,Rodolfo,Terra,Sheri,Iris,Maxwell,Kendall,Ashly,Kendrick,Jean,Jarvis,Fred,Tierra,Abel,Pablo,Maribel,Donovan,Stephan,Judy,Elliott,Tyrell,Chanel,Miles,Fabian,Alfonso,Cierra,Mason,Larissa,Elliot,Brenna,Bradford,Kristal,Gustavo,Gretchen,Derick,Jarred,Pierre,Lloyd,Jolene,Marlene,Leo,Jamar,Dianna,Noel,Angie,Tatiana,Rick,Leann,Corinne,Sydney,Belinda,Lora,Mackenzie,Herbert,Guillermo,Tameka,Elias,Janine,Ben,Stefan,Josephine,Dominick,Jameson,Bobbi,Blanca,Josue,Esmeralda,Darin,Ashely,Clay,Cassidy,Roland,Ismael,Harrison,Lorraine,Owen,Daniela,Rocky,Marisela,Saul,Kory,Dexter,Chandra,Gwendolyn,Francesca,Alaina,Mandi,Fallon,Celia,Vivian,Rolando,Raven,Lionel,Carolina,Tania,Joann,Casandra,Betsy,Tracie,Dante,Trey,Margarita,Skyler,Sade,Lyndsay,Jacklyn,Marina,Rogelio,Racheal,Mollie,Liliana,Maegan,Felipe,Malcolm,Santana,Anastasia,Madeline,Breanne,Tiffanie,Dillon,Melisa,Darrin,Carlton,Cornelius,Precious,Ivy,Lea,Susana,Loren,Jeff,Chiquita,Teri,Tera,Caitlyn,Hailey,Donte,Oliver,Natalia,Cherie,Lakisha,Karissa,Jeannette,Ariana,Lucia,Jerrod,Kassandra,Guy,Milton,Micaela,Krystina,Esteban,Gilberto,Chelsie,Antwan,Cathy,Ty,Shante,Roman,Kylie,Mercedes,Dena,Christi,Latrice,Kellen,Freddie,Clara,Rosanna,Demarcus,Domonique,Alvaro,Shaina,Nathanael,Kacie,Jodie,Dusty,Sidney,Adrianne,Mike,Chloe,Alecia,Sam,Rocio,Kim,Arlene,Antonia,Jamaal,Shantel,Deidre,Salvatore,Kimberley,Gerard,Gene,Weston,Diego,Tasia,Mariah,Jimmie,Zackary,Hugo,Leanna,Lacie,Donnie,Aisha,Marianne,Lana,Kyla,Ginger,Tiana,Lashonda,Dayna,Marcia,Luz,Janna,Riley,Desirae,Billie,Zane,Johnnie,Greg,Angelique,Kali,Silvia,Asia,Quincy,Catrina,Rusty,Frankie,Athena,Randolph,Sheldon,Maricela,Tomas,Toby,Nadine,Keshia,Tosha,Maranda,Lester,Brendon,Korey,Lynette,Joan,Justina,Moses,Dominque,Abbey,Kristyn,Dewayne,Alonzo,Laci,Cori,Debbie,Zackery,Parker,Forrest,Blaine,Trina,Herman,Selena,Myra,Joni,Bailey,Julianna,Edith,Octavia,Bryon,Arielle,Giovanni,Jarod,Floyd,Sonja,Kody,Jamel,Jeannie,Elissa,Leonardo,Sadie,Madison,Kandice,Janie,Reid,Alanna,Linsey,Moises,Darcy,Britni,Beatrice,Everett,Corina,Brooks,Tori,Ramiro,Lamont,Kenya,Cheri,Alec,Roberta,Jeanne,Jackson,Maritza,Loretta,Shameka,Sebastian,Ryne,Scotty,Emilie,Ladonna,Stewart,Dina,Clark,Chadwick,Araceli,Ali,Kareem,Janette,Savanna,Reuben`.split(','));
  }

  /**
   * @description - Generates a random human last name. Just has a long string of names and picks one randomly.
   * @returns {string} - The chosen last name.
   */
  private generateLastName(): string {
    return this.randOf<string>(`Smith,Johnson,Williams,Brown,Jones,Garcia,Miller,Davis,Rodriguez,Martinez,Hernandez,Lopez,Gonzalez,Wilson,Anderson,Thomas,Taylor,Moore,Jackson,Martin,Lee,Perez,Thompson,White,Harris,Sanchez,Clark,Ramirez,Lewis,Robinson,Walker,Young,Allen,King,Wright,Scott,Torres,Nguyen,Hill,Flores,Green,Adams,Nelson,Baker,Hall,Rivera,Campbell,Mitchell,Carter,Roberts,Gomez,Phillips,Evans,Turner,Diaz,Parker,Cruz,Edwards,Collins,Reyes,Stewart,Morris,Morales,Murphy,Cook,Rogers,Gutierrez,Ortiz,Morgan,Cooper,Peterson,Bailey,Reed,Kelly,Howard,Ramos,Kim,Cox,Ward,Richardson,Watson,Brooks,Chavez,Wood,James,Bennett,Gray,Mendoza,Ruiz,Hughes,Price,Alvarez,Castillo,Sanders,Patel,Myers,Long,Ross,Foster,Jimenez,Powell,Jenkins,Perry,Russell,Sullivan,Bell,Coleman,Butler,Henderson,Barnes,Gonzales,Fisher,Vasquez,Simmons,Romero,Jordan,Patterson,Alexander,Hamilton,Graham,Reynolds,Griffin,Wallace,Moreno,West,Cole,Hayes,Bryant,Herrera,Gibson,Ellis,Tran,Medina,Aguilar,Stevens,Murray,Ford,Castro,Marshall,Owens,Harrison,Fernandez,Mcdonald,Woods,Washington,Kennedy,Wells,Vargas,Henry,Chen,Freeman,Webb,Tucker,Guzman,Burns,Crawford,Olson,Simpson,Porter,Hunter,Gordon,Mendez,Silva,Shaw,Snyder,Mason,Dixon,Munoz,Hunt,Hicks,Holmes,Palmer,Wagner,Black,Robertson,Boyd,Rose,Stone,Salazar,Fox,Warren,Mills,Meyer,Rice,Schmidt,Garza,Daniels,Ferguson,Nichols,Stephens,Soto,Weaver,Ryan,Gardner,Payne,Grant,Dunn,Kelley,Spencer,Hawkins,Arnold,Pierce,Vazquez,Hansen,Peters,Santos,Hart,Bradley,Knight,Elliott,Cunningham,Duncan,Armstrong,Hudson,Carroll,Lane,Riley,Andrews,Alvarado,Ray,Delgado,Berry,Perkins,Hoffman,Johnston,Matthews,Pena,Richards,Contreras,Willis,Carpenter,Lawrence,Sandoval,Guerrero,George,Chapman,Rios,Estrada,Ortega,Watkins,Greene,Nunez,Wheeler,Valdez,Harper,Burke,Larson,Santiago,Maldonado,Morrison,Franklin,Carlson,Austin,Dominguez,Carr,Lawson,Jacobs,Obrien,Lynch,Singh,Vega,Bishop,Montgomery,Oliver,Jensen,Harvey,Williamson,Gilbert,Dean,Sims,Espinoza,Howell,Li,Wong,Reid,Hanson,Le,Mccoy,Garrett,Burton,Fuller,Wang,Weber,Welch,Rojas,Lucas,Marquez,Fields,Park,Yang,Little,Banks,Padilla,Day,Walsh,Bowman,Schultz,Luna,Fowler,Mejia,Davidson,Acosta,Brewer,May,Holland,Juarez,Newman,Pearson,Curtis,Cortez,Douglas,Schneider,Joseph,Barrett,Navarro,Figueroa,Keller,Avila,Wade,Molina,Stanley,Hopkins,Campos,Barnett,Bates,Chambers,Caldwell,Beck,Lambert,Miranda,Byrd,Craig,Ayala,Lowe,Frazier,Powers,Neal,Leonard,Gregory,Carrillo,Sutton,Fleming,Rhodes,Shelton,Schwartz,Norris,Jennings,Watts,Duran,Walters,Cohen,Mcdaniel,Moran,Parks,Steele,Vaughn,Becker,Holt,Deleon,Barker,Terry,Hale,Leon,Hail,Benson,Haynes,Horton,Miles,Lyons,Pham,Graves,Bush,Thornton,Wolfe,Warner,Cabrera,Mckinney,Mann,Zimmerman,Dawson,Lara,Fletcher,Page,Mccarthy,Love,Robles,Cervantes,Solis,Erickson,Reeves,Chang,Klein,Salinas,Fuentes,Baldwin,Daniel,Simon,Velasquez,Hardy,Higgins,Aguirre,Lin,Cummings,Chandler,Sharp,Barber,Bowen,Ochoa,Dennis,Robbins,Liu,Ramsey,Francis,Griffith,Paul,Blair,Oconnor,Cardenas,Pacheco,Cross,Calderon,Quinn,Moss,Swanson,Chan,Rivas,Khan,Rodgers,Serrano,Fitzgerald,Rosales,Stevenson,Christensen,Manning,Gill,Curry,Mclaughlin,Harmon,Mcgee,Gross,Doyle,Garner,Newton,Burgess,Reese,Walton,Blake,Trujillo,Adkins,Brady,Goodman,Roman,Webster,Goodwin,Fischer,Huang,Potter,Delacruz,Montoya,Todd,Wu,Hines,Mullins,Castaneda,Malone,Cannon,Tate,Mack,Sherman,Hubbard,Hodges,Zhang,Guerra,Wolf,Valencia,Franco,Saunders,Rowe,Gallagher,Farmer,Hammond,Hampton,Townsend,Ingram,Wise,Gallegos,Clarke,Barton,Schroeder,Maxwell,Waters,Logan,Camacho,Strickland,Norman,Person,Colon,Parsons,Frank,Harrington,Glover,Osborne,Buchanan,Casey,Floyd,Patton,Ibarra,Ball,Tyler,Suarez,Bowers,Orozco,Salas,Cobb,Gibbs,Andrade,Bauer,Conner,Moody,Escobar,Mcguire,Lloyd,Mueller,Hartman,French,Kramer,Mcbride,Pope,Lindsey,Velazquez,Norton,Mccormick,Sparks,Flynn,Yates,Hogan,Marsh,Macias,Villanueva,Zamora,Pratt,Stokes,Owen,Ballard,Lang,Brock,Villarreal,Charles,Drake,Barrera,Cain,Patrick,Pineda,Burnett,Mercado,Santana,Shepherd,Bautista,Ali,Shaffer,Lamb,Trevino,Mckenzie,Hess,Beil,Olsen,Cochran,Morton,Nash,Wilkins,Petersen,Briggs,Shah,Roth,Nicholson,Holloway,Lozano,Flowers,Rangel,Hoover,Arias,Short,Mora,Valenzuela,Bryan,Meyers,Weiss,Underwood,Bass,Greer,Summers,Houston,Carson,Morrow,Clayton,Whitaker,Decker,Yoder,Collier,Zuniga,Carey,Wilcox,Melendez,Poole,Roberson,Larsen,Conley,Davenport,Copeland,Massey,Lam,Huff,Rocha,Cameron,Jefferson,Hood,Monroe,Anthony,Pittman,Huynh,Randall,Singleton,Kirk,Combs,Mathis,Christian,Skinner,Bradford,Richard,Galvan,Wall,Boone,Kirby,Wilkinson,Bridges,Bruce,Atkinson,Velez,Meza,Roy,Vincent,York,Hodge,Villa,Abbott,Allison,Tapia,Gates,Chase,Sosa,Sweeney,Farrell,Wyatt,Dalton,Horn,Barron,Phelps,Yu,Dickerson,Heath,Foley,Atkins,Mathews,Bonilla,Acevedo,Benitez,Zavala,Hensley,Glenn,Cisneros,Harrell,Shields,Rubio,Choi,Huffman,Boyer,Garrison,Arroyo,Bond,Kane,Hancock,Callahan,Dillon,Cline,Wiggins,Grimes,Arellano,Melton,Oneill,Savage,Ho,Beltran,Pitts,Parrish,Ponce,Rich,Booth,Koch,Golden,Ware,Brennan,Mcdowell,Marks,Cantu,Humphrey,Baxter,Sawyer,Clay,Tanner,Hutchinson,Kaur,Berg,Wiley,Gilmore,Russo,Villegas,Hobbs,Keith,Wilkerson,Ahmed,Beard,Mcclain,Montes,Mata,Rosario,Vang,S,S,Walter,Henson,Oneal,Mosley,Mcclure,Beasley,Stephenson,Snow,Huerta,Preston,Vance,Barry,Johns,Eaton,Blackwell,Dyer,Prince,Macdonald,Solomon,Guevara,Stafford,English,Hurst,Woodard,Cortes,Shannon,Kemp,Nolan,Mccullough,Merritt,Murillo,Moon,Salgado,Strong,Kline,Cordova,Barajas,Roach,Rosas,Winters,Jacobson,Lester,Knox,Bullock,Kerr,Leach,Meadows,Davila,Orr,Whitehead,Pruitt,Kent,Conway,Mckee,Barr,David,Dejesus,Marin,Berger,Mcintyre,Blankenship,Gaines,Palacios,Cuevas,Bartlett,Durham,Dorsey,Mccall,Odonnell,Stein,Browning,Stout,Lowery,Sloan,Mclean,Hendricks,Calhoun,Sexton,Chung,Gentry,Hull,Duarte,Ellison,Nielsen,Gillespie,Buck,Middleton,Sellers,Leblanc,Esparza,Hardin,Bradshaw,Mcintosh,Howe,Livingston,Frost,Glass,Morse,Knapp,Herman,Stark,Bravo,Noble,Spears,Weeks,Corona,Frederick,Buckley,Mcfarland,Hebert,Enriquez,Hickman,Quintero,Randolph,Schaefer,Walls,Trejo,House,Reilly,Pennington,Michael,Conrad,Giles,Benjamin,Crosby,Fitzpatrick,Donovan,Mays,Mahoney,Valentine,Raymond,Medrano,Hahn,Mcmillan,Small,Bentley,Felix,Peck,Lucero,Boyle,Hanna,Pace,Rush,Hurley,Harding,Mcconnell,Bernal,Nava,Ayers,Everett,Ventura,Avery,Pugh,Mayer,Bender,Shepard,Mcmahon,Landry,Case,Sampson,Moses,Magana,Blackburn,Dunlap,Gould,Duffy,Vaughan,Herring,Mckay,Espinosa,Rivers,Farley,Bernard,Ashley,Friedman,Potts,Truong,Costa,Correa,Blevins,Nixon,Clements,Fry,Delarosa,Best,Benton,Lugo,Portillo,Dougherty,Crane,Haley,Phan,Villalobos,Blanchard,Horne,Finley,Quintana,Lynn,Esquivel,Bean,Dodson,Mullen,Xiong,Hayden,Cano,Levy,Huber,Richmond,Moyer,Lim,Frye,Sheppard,Mccarty,Avalos,Booker,Waller,Parra,Woodward,Jaramillo,Krueger,Rasmussen,Brandt,Peralta,Donaldson,Stuart,Faulkner,Maynard,Galindo,Coffey,Estes,Sanford,Burch,Maddox,Vo,Oconnell,Vu,S,S,Andersen,Spence,Mcpherson,Church,Schmitt,Stanton,Leal,Cherry,Compton,Dudley,Sierra,Pollard,Alfaro,Hester,Proctor,Lu,Hinton,Novak,Good,Madden,Mccann,Terrell,Jarvis,Dickson,Reyna,Cantrell,Mayo,Branch,Hendrix,Rollins,Rowland,Whitney,Duke,Odom,Daugherty,Travis,Tang`.split(','));
  }

  /**
   * @description - Uses the first three starter pokemon as a seed
   * @returns {Pokemon} - returns a random starter pokemon
   */
  private generatePokemon(): Pokemon | null {

    if (this.nextRand() < 0.3) { // Return null 33% of the time
      return null;
    }

    return this.randOf<Pokemon>([
      {
        id: 1,
        name: 'bulbasaur',
        sprites: {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        }
      },
      {
        id: 4,
        name: 'charmander',
        sprites: {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
        }
      },
      {
        id: 7,
        name: 'squirtle',
        sprites: {
          front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
        }
      }])
  }
}

export interface JobData {
  accountNumber: number,
  firstName: string,
  lastName: string,
  location: Location,
  appointment: string,
  email: string,
  phone: number,
  jobType: string,
  transportType: string,
  history: History[],
  facilities: Facility[],
  services: Services,
  pokemon: Pokemon
}

interface Facility {
  heading: string,
  address: string,
  cable?: number,
  pair?: number,
  port?: number,
}

interface Services {
  equipment: string[];
  internetSpeed?: number;
  potsNumber?: number;
  voipNumbers?: number[];
  uversePackage?: string;
}

interface History {
  title: string,
  date: string,
  info: string[]
}

interface Location {
  lat: number,
  long: number
  streetAddress: string,
  state: string,
  city: string,
  zip?: number,
} 