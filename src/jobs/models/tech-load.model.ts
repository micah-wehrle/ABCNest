export class TechLoad {

  // TODO list:
  // [x] Create facilities generator
  // [ ] Create services generator
  // [ ] jsdocs

  public jobs: JobData[];
  public jobCount: number;
  public uuid: string;

  private seed: number;
  private seedIndex: number = 0; // doesn't really matter what it's instantiated to, just needs to be any number >= 0 so the seed methods can generate the next number

  constructor(uuid: string, amount?: number) {
    this.uuid = uuid;
    this.seed = Math.abs(this.convertStrToNum(uuid));
    
    this.jobs = [];
    // generate a random number of jobs, weighted towards ~3
    const generatedJobCount = Math.round( (this.nextRand()*7 + this.nextRand()*7) / 2 );  // This line needs to run regardless of if we were passed an amount, or else the seeded rng will get messed up!
    this.jobCount = amount ? amount : generatedJobCount;
    for (let i = 0; i < this.jobCount; i++) {
      this.jobs.push(this.generateJob());
    }
  }

  /**
   * @description - Called by constructor to generate a job. 
   * @returns {JobData} 
   */
  private generateJob(): JobData {
    const firstName = this.randOf(['Aaron', 'Ed', 'Kerry', 'Micah', 'Raul', 'Tyler']);
    const lastName = this.randOf(['Smith', 'Jones', 'Collins', 'Doe', 'Simmons', 'Taylor']);
    const streetAddress = this.generateStreetAddress();
    const jobType = this.randOf(['Install', 'Repair', 'Helper', 'POTS', 'BSW']);
    const transportType = jobType === 'POTS' || this.nextRand() < 0.5 ? this.randOf(['IP-CO', 'IP-RT', 'FTTN', 'FTTN-BP']) : this.randOf(['FTTP GPON', 'FTTP XGS-PON']);
    const curJob: JobData = {
      firstName: firstName,
      lastName: lastName,
      accountNumber: this.randDigits(7),
      location: {
        zip: this.randDigits(5),
        ...this.generateCityLocation(streetAddress)
      },
      appointment: this.generateAppointment(),
      email: this.generateEmail(firstName, lastName),
      phone: this.randDigits(10),
      history: this.generateHistory(),
      jobType: jobType,
      transportType: transportType,
      facilities: this.generateFacilities(transportType, streetAddress),
      services: this.generateServices(transportType)
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
      hash = ((hash << 5) - hash) + str.charCodeAt(i); // essentially convert the number to binary, shift the bits over 5, and add the new number
      hash |= 0; // converts the number to a 32bit integer
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
   * @description Generate a seeded email.
   * @param {string} first The user's first name
   * @param {string} last The user's last name
   * @returns {string} The finished email
   */
  private generateEmail(first: string, last: string): string {
    const domains: string[] = ['gmail', 'aol', 'adelphia', 'yahoo', 'bell', 'att', 'microsoft', 'outlook'];
    const topLevel: string[] = ['com', 'net', 'gov', 'co.uk', 'org', 'edu'];

    let email = '';
    email += this.nextRand() < 0.1 ? `${this.randOf(['the', 'nice', 'fast'])}.` : '';
    email += this.nextRand() < 0.5 ? first.charAt(0) : first; // Add first name
    email += this.nextRand() < 0.5 ? '.' : '_'; // Add first/last spacer
    email += last; 
    email += this.nextRand() < 0.2 ? `.${this.randOf(['inc', 'worldwide', 'sports'])}` : '';
    email += this.nextRand() < 0.5 ? this.randDigits(2,4) : ''; // Add some amount of numbers
    email += `@${this.randOf(domains)}.${this.randOf(topLevel)}`; // add @ and domain
    return email;
  }

  private generateAppointment(): string {
    return this.randOf(['8-10', '10-12', '8-12', '8-8', '12-2', '2-4', '12-4', '4-8']);
  }

  private generateStreetAddress(): string {
    const streetNames: string[] = ['Main', 'Church', 'High', 'Elm', 'Park', 'Walnut', 'Washington', '2nd', 'Chestnut', 'Broad', 'Maple', 'Oak', 'Maple', 'Center', 'Pine', 'River', 'Market', 'Washington', 'Water', 'Union', '3rd', 'South', '4th'];
    const streetTypes: string[] = ['St', 'Ln', 'Ave', 'Dr', 'Blvd', 'Park', 'Rd'];

    return `${this.randDigits(3,6)} ${this.randOf(streetNames)} ${this.randOf(streetTypes)}`;
  }

  private generateFacilityAddress(streetAddress?: string): string {
    const locationPrefix: string[] = ['F', 'S', 'R', 'B'];

    return `${this.randOf(locationPrefix)} ${!streetAddress ? this.generateStreetAddress() : streetAddress}`;
  }

  private convertToNearbyFacilityAddress(streetAddress: string): string {
    const addressSplit: string[] = streetAddress.split(' ');
    const addressNum: number = +addressSplit.shift();

    const newAddress = `${addressNum + ( Math.floor(this.nextRand()*5)-2) * (Math.floor(this.nextRand()*6) )} ${addressSplit.join(' ')}`;

    return this.generateFacilityAddress(newAddress); // add prefix
  }

  private generateHistory(): History[] {
    const historyEntries: History[] = [];
    const historyEntryCount: number = Math.floor(this.nextRand() * 7) + 3;
    let lastDate = (new Date()).getTime() - 1000*3600*24; // minus one day so it was yesterday. Technically won't be consistent between days, could always pick a random date in the past so it's fully procedural.

    for (let i = 0; i < historyEntryCount; i++) {
      const historyEntryTitle: string = this.randOf(['Interaction', 'Dispatch', 'Case']);
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
          curHistoryEntryInfo.push(`Status: ${this.randOf(['COMPLETE', 'RETURNED', 'PENDING'])}`);
          curHistoryEntryInfo.push(`Dispatch Type: ${this.randOf(['IEFS', 'TFS', 'LMNO', 'MachOp', 'MachOke', 'MachAmp'])}`);
          curHistoryEntryInfo.push(`Tech Notes: ${this.uuid ? this.uuid : 'tr99aa'}; ${this.randOf(['Worked on hsia. Probably wont be in service long but fingers crossed.', 'Lots of work done but will come back later to completely complete work.', 'Customer asked me if I always dressed like this. I said yes. I always do, I only have one uniform. I mean I have multiple uniforms, but they all look the same. I asked why they asked. They just said they were curious. I left.'])}`);
          break;
        case 'Case':
          let minutes: string = ''+Math.floor(this.nextRand()*60);
          if (minutes.length === 1) {
            minutes = `0${minutes}`;
          }
          curHistoryEntryInfo.push(`Case Creation Time: ${Math.ceil(this.nextRand()*12)}:${minutes} ${this.nextRand() < 0.5 ? 'A':'P'}M`);
          curHistoryEntryInfo.push(`Case Status: ${this.nextRand() < 0.2 ? 'OPEN' : 'CLOSED'}`);
          curHistoryEntryInfo.push(`Notes: ${this.randOf(['Customer wanted to verify if they did in fact have service with us. They do. Informed customer.', 'Customer\'s internet is not working. Followed troubleshooting flow. Customer had cell phone upside down.', 'Customer is wondering why this entry type would be any different than Interaction entries, but idk I just whipped this up so we will roll with it.'])}`);
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

  private generateFacilities(transportType: string, cxAddress: string): Facility[] {
    let facilitiesOutput: Facility[] = [];
    const isFiber: boolean = transportType.substring(0,4) === 'FTTP';
    const fiberFacilitiesHeadings = ['PFP', 'CFST', 'Prem'];
    const facilitiesCount = isFiber ? 3 : Math.floor((this.nextRand()*5 + this.nextRand()*5) / 2);
    
    for (let i = 0; i < facilitiesCount; i++) {
      facilitiesOutput.push({
        heading: isFiber ? fiberFacilitiesHeadings[i] : `F${i+1}`,
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

  private generateServices(transportType): Service[] {
    return []; // Not really sure what this is. I guess speed and stuff.
  }

  /**
   * @description Will return a random element of the given array based off of the global seeded random number generator
   * @param {string[]} options An array of possible options to pseudo-randomly choose from 
   * @returns {string} A pseudo-randomly selected element from the array
   */
  private randOf<T>(options: T[]): T {
    return options[Math.floor(this.nextRand() * options.length)];
  }

  private randDigits(lowDigits: number, highDigits?: number): number {
    let output: number;
    let digits: number;
    if (!highDigits) {
      digits = lowDigits;
      output = Math.floor(this.nextRand() * (10 ** lowDigits));
    }
    else {
      digits = Math.floor(this.nextRand() * (highDigits-lowDigits)) + lowDigits;
      output = Math.floor(this.nextRand() * Math.pow(10, digits));
    }

    while (output < 10 ** (digits-1)) {
      output *= 10;
    }

    return output;
  }

  private generateCityLocation(streetAddress: string): Location {
    const locations = `AL,Montgomery,32.377716,-86.300568
AK,Juneau,58.301598,-134.420212
AZ,Phoenix,33.448143,-112.096962
AR,Little Rock,34.746613,-92.288986
CA,Sacramento,38.576668,-121.493629
CO,Denver,39.739227,-104.984856
CT,Hartford,41.764046,-72.682198
DE,Dover,39.157307,-75.519722
HI,Honolulu,21.307442,-157.857376
FL,Tallahassee,30.438118,-84.281296
GA,Atlanta,33.749027,-84.388229
ID,Boise,43.617775,-116.199722
IL,Springfield,39.798363,-89.654961
IN,Indianapolis,39.768623,-86.162643
IA,Des Moines,41.591087,-93.603729
KS,Topeka,39.048191,-95.677956
KY,Frankfort,38.186722,-84.875374
LA,Baton Rouge,30.457069,-91.187393
ME,Augusta,44.307167,-69.781693
MD,Annapolis,38.978764,-76.490936
MA,Boston,42.358162,-71.063698
MI,Lansing,42.733635,-84.555328
MN,St. Paul,44.955097,-93.102211
MS,Jackson,32.303848,-90.182106
MO,Jefferson City,38.579201,-92.172935
MT,Helena,46.585709,-112.018417
NE,Lincoln,40.808075,-96.699654
NV,Carson City,39.163914,-119.766121
NH,Concord,43.206898,-71.537994
NJ,Trenton,40.220596,-74.769913
NM,Santa Fe,35.68224,-105.939728
NC,Raleigh,35.78043,-78.639099
ND,Bismarck,46.82085,-100.783318
NY,Albany,42.652843,-73.757874
OH,Columbus,39.961346,-82.999069
OK,Oklahoma City,35.492207,-97.503342
OR,Salem,44.938461,-123.030403
PA,Harrisburg,40.264378,-76.883598
RI,Providence,41.830914,-71.414963
SC,Columbia,34.000343,-81.033211
SD,Pierre,44.367031,-100.346405
TN,Nashville,36.16581,-86.784241
TX,Austin,30.27467,-97.740349
UT,Salt Lake City,40.777477,-111.888237
VT,Montpelier,44.262436,-72.580536
VA,Richmond,37.538857,-77.43364
WA,Olympia,47.035805,-122.905014
WV,Charleston,38.336246,-81.612328
WI,43.074684,-89.384445
WY,Cheyenne,41.140259,-104.820236`.split('\n').map(function(el: string): Location { // kinda gross, but this basically converts the above string into an array of City objects
      const parts = el.split(',');
      return {streetAddress: streetAddress, state: parts[0], city: parts[1], lat: +parts[2], long: +parts[3]};
    });
    return this.randOf(locations);
  } // End of generateCityLocation()
  
}

interface JobData {
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
  services: Service[],
}

interface Facility {
  heading: string,
  address: string,
  cable?: number,
  pair?: number,
  port?: number,
}

interface Service {
  type: string,
  transport?: string,
  equipment?: string,
  phone1?: number,
  phone2?: number,
  profile?: string,
}

interface History {
  title: string,
  date: string,
  info: string[]
}

interface Location {
  streetAddress: string,
  state: string,
  city: string,
  zip?: number,
  lat: number,
  long: number
} 