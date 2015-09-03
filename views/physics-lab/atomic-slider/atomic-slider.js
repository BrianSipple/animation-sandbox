const 
    SELECTORS = {
        atom: '.atom',
        atomContainer: '.atom__container',
        tabSelectors: '.tab-selectors',
        tab: '.tab',
        tabLink: '.tab__link',
        
        // Insert protons and neutrons in this
        nucleusContainer: '.atom__nucleus--container',                
        // Insert Electons in these
        electronContainerShell1: '.atom__orbit-path-1 .electron--container',
        electronContainerShell2: '.atom__orbit-path-2 .electron--container',
        electronContainerShell3: '.atom__orbit-path-3 .electron--container',
        electronContainerShell4: '.atom__orbit-path-4 .electron--container',
        
        // Insert Atom Data into its appropriate element element        
        dataPaneTitle: '.data-pane__title',
        dataPaneNumber: '.data-pane__atomic-number',
        dataPaneSymbol: '.data-pane__symbol',
        dataPaneMass: '.data-pane__atomic-mass',
        dataPaneRadius: '.data-pane__atomic-radius',
        dataPaneProtons: '.data-pane__protons',
        dataPaneNeutrons: '.data-pane__neutrons',
        dataPaneElectrons: '.data-pane__electrons',
        dataPaneMeltingPoint: '.data-pane__melting-point',
        dataPaneBoilingPoint: '.data-pane__boiling-point',
        dataPaneValenceShells: '.data-pane__valence-shells'
    },
      
      CLASSES = {
          active: 'active',
          atom: 'atom',          
          proton: 'proton',          
          neutron: 'neutron',
          particle: 'atom-particle',
          nucleusParticle: 'atom-particle__nucleus',        
          electron: 'electron',
          particleVisible: 'visible',
          particleHidden: 'hidden',
          electronContainerShell1: 'atom__orbit-path-1 electron--container',
          electronContainerShell1: 'atom__orbit-path-2 electron--container',
          electronContainerShell1: 'atom__orbit-path-3 electron--container',
          electronContainerShell1: 'atom__orbit-path-4 electron--container'
      },
      
      ATTRIBUTES = {
          atomKey:  'data-atom-key'
      },
      
      DURATIONS = {
          nucleusIntroDelay: 900, // ms
          electronIntroDelay: 900
      };

let
    atomContainerElem = document.querySelector(SELECTORS.atomContainer),
    atomElem = document.querySelector(SELECTORS.atom),
    tabSelectorsElem = document.querySelector(SELECTORS.tabSelectors),
    tabLinkElems = tabSelectorsElem.querySelectorAll(SELECTORS.tabLink),
    nucleusContainerElem = document.querySelector(SELECTORS.nucleusContainer),
    electronContainerShell1 =
        document.querySelector(SELECTORS.electronContainerShell1),
    electronContainerShell2 =
        document.querySelector(SELECTORS.electronContainerShell2),
    electronContainerShell3 =
        document.querySelector(SELECTORS.electronContainerShell3),
    electronContainerShell4 =
        document.querySelector(SELECTORS.electronContainerShell4),
    
    electronElemsCache = [], // cache all electrons here after creation
    
    dataPaneElem = document.querySelector('.data-pane'),
    
    dataPaneElems = {        
        title: dataPaneElem.querySelector(SELECTORS.dataPaneTitle),
        symbol: dataPaneElem.querySelector(SELECTORS.dataPaneSymbol),
        atomicNumber: dataPaneElem.querySelector(SELECTORS.dataPaneNumber),
        atomicMass: dataPaneElem.querySelector(SELECTORS.dataPaneMass),
        atomicRadius: dataPaneElem.querySelector(SELECTORS.dataPaneRadius),
        numProtons: dataPaneElem.querySelector(SELECTORS.dataPaneProtons),
        numNeutrons: dataPaneElem.querySelector(SELECTORS.dataPaneNeutrons),
        numElectrons: dataPaneElem.querySelector(SELECTORS.dataPaneElectrons),
        meltingPoint: dataPaneElem.querySelector(SELECTORS.dataPaneMeltingPoint),
        boilingPoint: dataPaneElem.querySelector(SELECTORS.dataPaneBoilingPoint),
        numShells: dataPaneElem.querySelector(SELECTORS.dataPaneValenceShells)
    },
        
    ATOMS = {
      hydrogen: {
          
          // Create and cache DOM references on the object on init
          protonElems: undefined,                
          neutronElems: undefined,       
          electronElems: undefined, 
          
          // class to add as a modifier (e.g: proton--hydrogen)
          modifyingClassName: 'hydrogen',   
          title: 'Hydrogen',
          symbol: 'H',
          atomicNumber: 1,
          atomicMass: 1.00794,          // amu
          atomicRadius: 53,             // pm
          meltingPoint: -259.14,        // celcius
          boilingPoint: -252.87,        // celcius
          numProtons: 1,
          numNeutrons: 0,
          numElectrons: 1,
          numShells: 1
      },
      carbon: {
          protonElems: undefined,
          neutronElems: undefined,       
          electronElems: undefined,
          modifyingClassName: 'carbon',   
          title: 'Carbon',
          symbol: 'C',
          atomicNumber: 12,
          atomicMass: 12.0107,
          atomicRadius: 67,
          meltingPoint: 3500.0,
          boilingPoint: 4827,              
          numProtons: 6,
          numNeutrons: 6,
          numElectrons: 6,
          numShells: 3
      },
      nitrogen: {
          protonElems: undefined,
          neutronElems: undefined,       
          electronElems: undefined,
          modifyingClassName: 'nitrogen',
          title: 'Nitrogen',
          symbol: 'N',
          atomicNumber: 7,
          atomicMass: 14.00674,
          atomicRadius: 56,
          meltingPoint: -209.9,
          boilingPoint: -195.8,              
          numProtons: 7,
          numNeutrons: 7,
          numElectrons: 7,
          numShells: 3
      },
      oxygen: {
          protonElems: undefined,
          neutronElems: undefined,       
          electronElems: undefined,
          modifyingClassName: 'oxygen',
          title: 'Oxygen',
          symbol: 'O',
          atomicNumber: 8,
          atomicMass: 15.9994,
          atomicRadius: 48,
          meltingPoint: -218.4,
          boilingPoint: -183.0,              
          numProtons: 8,
          numNeutrons: 8,
          numElectrons: 8,
          numShells: 3
      },
      phosphorus: {
          protonElems: undefined,
          neutronElems: undefined,       
          electronElems: undefined,
          modifyingClassName: 'phosphorus',
          title: 'Phosphorus',
          symbol: 'P',
          atomicNumber: 15,
          atomicMass: 30.97376,
          meltingPoint: 44.1,
          boilingPoint: 280.0,
          atomicRadius: 98,   
          numProtons: 15,
          numNeutrons: 16,
          numElectrons: 15,
          numShells: 3
      },
      calcium: {
          protonElems: undefined,
          neutronElems: undefined,       
          electronElems: undefined,
          modifyingClassName: 'calcium',
          title: 'Calcium',
          symbol: 'Ca',
          atomicNumber: 20,
          atomicMass: 40.078,
          meltingPoint: 839.0,
          boilingPoint: 1484.0,
          atomicRadius: 194,
          numProtons: 20,
          numNeutrons: 20,
          numElectrons: 20,
          numShells: 3
      },
  },
    
    ACTIVE_ATOM_KEY = 'carbon',
    
    removeTabClasses = () => {
        [].forEach.call(tabLinkElems, (tabLinkElem) => {
            tabLinkElem.classList.remove(CLASSES.active);
            tabLinkElem.parentNode.classList.remove(CLASSES.active);
        });
    },
    
    removeParticles = (atomKey) => {
        
        for (let particleElem of nucleusContainerElem.children) {
           particleElem.classList.remove(CLASSES.particleVisible);
           particleElem.classList.add(CLASSES.particleHidden);
        };                
        
//        for (let electronElem of ATOMS[atomKey].electronElems) {
//            electronElem.classList.remove(CLASSES.particleVisible);
//            electronElem.classList.add(CLASSES.particleHidden);
//        }        
    },
    
    setActiveTabElem = (ev) => {
        let tabElemLink = ev.target;
        tabElemLink.parentNode.classList.add(CLASSES.active);
        tabElemLink.classList.add(CLASSES.active);
    },
    
    findActiveAtomKeyOnClick = (ev) => {
        return ev.target.getAttribute(ATTRIBUTES.atomKey);      
    },
    
    updateDataPane = (atomKey) => {
        
        let atom = ATOMS[atomKey];
        
        dataPaneElems.title.textContent = atom.title;
        dataPaneElems.symbol.textContent = atom.symbol;    
        dataPaneElems.atomicNumber.textContent = atom.atomicNumber;
        dataPaneElems.atomicMass.textContent = `${atom.atomicMass} amu`;
        dataPaneElems.atomicRadius.textContent = `${atom.atomicRadius} pm (picometres)`;
        dataPaneElems.numElectrons.textContent = atom.numElectrons;
        dataPaneElems.numNeutrons.textContent = atom.numNeutrons;
        dataPaneElems.numProtons.textContent = atom.numProtons;
        dataPaneElems.meltingPoint.textContent = `${atom.meltingPoint} ºC`;
        dataPaneElems.boilingPoint.textContent = `${atom.boilingPoint} ºC`;
        dataPaneElems.numShells.textContent = atom.numShells;
    },
    
    /**
     * After the previous atom's electrons have been removed, animate
     * in the new atom's electrons
     */
    animateElectronsIntoView = (prevAtomKey, currentAtomKey) => {  
                
        if (prevAtomKey && ATOMS[prevAtomKey]) {
            for (let electronElem of ATOMS[prevAtomKey].electronElems) {
                electronElem.classList.remove(CLASSES.particleVisible);
                electronElem.classList.add(CLASSES.particleHidden);
            }            
        }
                
        for (let electronElem of ATOMS[currentAtomKey].electronElems) {
            
            electronElem.classList.remove(CLASSES.particleHidden);
            electronElem.classList.add(CLASSES.particleVisible);
        }
    },    
       
    animateToActiveAtom = (prevAtomKey, currentAtomKey) => {
        let 
            atom = ATOMS[currentAtomKey],
            nucleusParticleElems = [];        
            //electronElems = [].concat.call(atom.electronElems);
        
        // join neutrons and protons before pasing into animation function
        for (let proton of atom.protonElems) {
            nucleusParticleElems.push(proton);
        }
        for (let neutron of atom.neutronElems) {
            nucleusParticleElems.push(neutron);
        }
        
        let prevModifyingClassName = '';
        if (ATOMS[prevAtomKey]) {
            prevModifyingClassName = ATOMS[prevAtomKey].modifyingClassName;
        }
                
        animateAtomBody(
            prevModifyingClassName,
            atom.modifyingClassName
        );
        
        setTimeout(() => {
            animateNucleusParticlesIntoView(nucleusParticleElems);
                                
            setTimeout(() => {
                animateElectronsIntoView(prevAtomKey, currentAtomKey);
            }, DURATIONS.electronIntroDelay); 
            
        }, DURATIONS.nucleusIntroDelay);
 
    },    
    
    
    handleTabClick = (ev) => {
        
        let prevAtomKey = ACTIVE_ATOM_KEY;
        
        ACTIVE_ATOM_KEY = findActiveAtomKeyOnClick(ev);
        
        removeTabClasses();
        removeParticles(ACTIVE_ATOM_KEY);
        setActiveTabElem(ev);
        updateDataPane(ACTIVE_ATOM_KEY);        
        animateToActiveAtom(prevAtomKey, ACTIVE_ATOM_KEY);    
    },
    
    animateNucleusParticlesIntoView = (elems) => {
        
        elems.forEach((elem) => {
            elem.classList.remove(CLASSES.particleHidden);
            elem.classList.add(CLASSES.particleVisible);
        });            
    },
                    
    animateAtomBody = (prevModifyingClass, currentModifyingClass) => {
        atomContainerElem.classList.remove(CLASSES.atom + '--' + prevModifyingClass);
        atomContainerElem.classList.add(CLASSES.atom + '--' + currentModifyingClass);        
    },
    
    
    wireUpTabSelectors = () => {
        tabSelectorsElem.addEventListener('click', handleTabClick, false);
    },
        
    createNucleusParticles = (n, startingClassName, nthChildMultiplier) => {
        
        let 
            particleElem,
            particleFragment = document.createDocumentFragment(),
            particles = [],
            className;
                    
        while (n--) {
            
            // Starting with a className unique to the TYPE of particle (proton or neutron)
            // Add classing relevant for nucleus styling
            className = startingClassName + ' ' + 
                CLASSES.particle + ' ' +                
                CLASSES.nucleusParticle + ' ' +
                CLASSES.nucleusParticle + '-' + (n * nthChildMultiplier) + ' ' +
                CLASSES.particleHidden;
                            
            particleElem = document.createElement('div');
            particleElem.className = className;
            
            particleFragment.appendChild(particleElem);
            particles.push(particleElem);
        }        
        
        nucleusContainerElem.appendChild(particleFragment);
        return particles;                                                
    },
    
    createElectrons = (numElectrons, numShells, startingClassName) => {
        // create
        let 
            electronElem,
            className,
            electronElems = [];
                    
        for (let i = 0; i < numElectrons; i++) {
            
            className = startingClassName + ' ' +
                startingClassName + '-' + i + ' ' +
                CLASSES.particle + ' ' +
                CLASSES.particleHidden;
                                        
            electronElem = document.createElement('div');
            electronElem.className = className;
            
            if (i < 2) {
                // shell 1
                electronContainerShell1.appendChild(electronElem);
            }
            else if (i < 10) {
                // shell 2
                electronContainerShell2.appendChild(electronElem);
            }
            else {
                // shell 3
                electronContainerShell3.appendChild(electronElem);
            }            
            electronElems.push(electronElem);
        }
        
        electronElemsCache.push(electronElems);
        return electronElems;
    },
    
    createAtomParticlesBecauseWereWizards = () => {
      
        let 
            atom,
            startingProtonClassName,
            startingNeutronClassName;
        
        Object.keys(ATOMS).forEach((atomKey) => {            
            
            atom = ATOMS[atomKey];            
            startingProtonClassName = 
                CLASSES.proton + ' ' + 
                CLASSES.proton + '--' + atom.modifyingClassName;
            startingNeutronClassName = 
                CLASSES.neutron + ' ' +
                CLASSES.neutron + '--' + atom.modifyingClassName;
            
            atom.protonElems = createNucleusParticles(atom.numProtons, startingProtonClassName, 1);
            atom.neutronElems = createNucleusParticles(atom.numNeutrons, startingNeutronClassName, 2);
            atom.electronElems = createElectrons(atom.numElectrons, atom.numShells, CLASSES.electron);  
        });                                      
    },
    
    
    init = () => {
        console.log('Big Bang');        
        wireUpTabSelectors();
        createAtomParticlesBecauseWereWizards();
        updateDataPane(ACTIVE_ATOM_KEY);
        animateToActiveAtom('', ACTIVE_ATOM_KEY);
    };





export default init();