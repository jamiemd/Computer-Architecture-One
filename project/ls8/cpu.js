/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require('fs');

// Instructions

const HLT = 0b00000001; // Halt CPU
const ADD = 0b10101000; // ADD R R
const MUL = 0b10101010; // MUL R R
const LDI = 0b10011001; // LDI R I
const PRN = 0b01000011;
const CALL = 0b01001000;
const RET = 0b00001001;
const NOP = 0b00000000;
const PUSH = 0b1001101;
const POP = 0b1001100;
const CMP = 0b1010000;


const SP = 7;

const FL_EQ = 0b00000001;
const FL_GT = 0b00000010;
const FL_LT = 0b00000100;

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {

    /**
     * Initialize the CPU
     */
    constructor(ram) {
        this.ram = ram;

        this.reg = new Array(8).fill(0); // General-purpose registers

        // Special-purpose registers
        this.reg.PC = 0; // Program Counter
        this.reg.IR = 0; // Instruction Register
        this.reg.FL = 0; // Flags

        // Init the stack pointer
        this.reg[SP] = 0xf3;

        this.setupBranchTable();
    }

	/**
	 * Sets up the branch table
	 */
    setupBranchTable() {
        let bt = {};
        // !!! IMPLEMENT ME

        bt[HLT] = this.HLT;
        bt[LDI] = this.LDI;
        bt[MUL] = this.MUL;
        bt[PRN] = this.PRN;
        bt[CALL] = this.CALL;
        bt[ADD] = this.ADD;
        bt[RET] = this.RET;
        bt[NOP] = this.NOP;
        bt[PUSH] = this.PUSH;
        bt[POP] = this.POP;
        bt[CMP] = this.CMP;

        this.branchTable = bt;
    }

    /**
     * Store value in memory address, useful for program loading
     */
    poke(address, value) {
        this.ram.write(address, value);
    }

    /**
     * Starts the clock ticking on the CPU
     */
    startClock() {
        const _this = this;

        this.clock = setInterval(() => {
            _this.tick();
        }, 1);
    }

    /**
     * Stops the clock
     */
    stopClock() {
        clearInterval(this.clock);
    }



    // set flag
    setFlag(flag, vlaue) {
        if (value == true) {
            this.reg.FL = this.reg.FL | flag;
        } else {
            this.reg.FL = this.reg.FL & (~flag);
        }
    }

    /**
     * ALU functionality
     * 
     * op can be: ADD SUB MUL DIV INC DEC CMP
     */
    alu(op, regA, regB) {
        switch (op) {
            case 'MUL':
                this.reg[regA] = this.reg[regA] * this.reg[regB]
                break;
            case 'ADD':
                this.reg[regA] = this.reg[regA] + this.reg[regB]
                break;
            case 'AND':
                this.reg[regA] = this.reg[regA] & this.reg[regB]
                break;
            case 'CMP':
                this.reg.FL = setFlag(FL_EQ, this.reg[regA] == this.reg[regB]);
                break;
        }
    }


    /**
     * Advances the CPU one cycle
     */
    tick() {
        // Load the instruction register (OR) from the current PC
        // !!! IMPLEMENT ME
        this.reg.IR = this.ram.read(this.reg.PC);

        // Debugging output array index and array value
        console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

        // Based on the value in the Instruction Register, locate the
        // appropriate hander in the branchTable
        // !!! IMPLEMENT ME
        let handler = this.branchTable[this.reg.IR];
        // Check that the handler is defined, halt if not (invalid
        // instruction)
        // !!! IMPLEMENT ME
        if (handler === undefined) {
            console.error('Unknown opcode ' + this.reg.IR);
            this.stopClock();
            return;
        }

        let operandA = this.ram.read(this.reg.PC + 1);
        let operandB = this.ram.read(this.reg.PC + 2);

        // We need to use call() so we can set the "this" value inside
        // the handler (otherwise it will be undefined in the handler)
        let nextPC = handler.call(this, operandA, operandB);

        if (nextPC == undefined) {
            // Increment the PC register to go to the next instruction
            // !!! IMPLEMENT ME
            this.reg.PC += ((this.reg.IR >> 6) & 0b00000011) + 1;;
        } else {
            this.reg.PC = nextPC;
        }
    }

    // INSTRUCTION HANDLER CODE:


    /**
     * ADD
     */
    ADD(regA, regB) {
        // !!! IMPLEMENT ME
        this.alu('ADD', regA, regB)
    }

    /**
     * HLT
     */
    HLT() {
        // !!! IMPLEMENT ME
        this.stopClock();
    }

    /**
     * LDI R,I
     */
    LDI(regNum, value) {
        // !!! IMPLEMENT ME
        this.reg[regNum] = value & 255; //adding with 255 limits the size to no more than 255
    }

    /**
     * MUL R,R
     */
    MUL(regA, regB) {
        // !!! IMPLEMENT ME
        this.alu('MUL', regA, regB);
    }

    /**
     * PRN R
     */
    PRN(regA) {
        // !!! IMPLEMENT ME
        console.log(this.reg[regA]);
    }

    NOP() {
        return;
    }

    pushHelper(value) {
        this.reg[SP]--;
        this.ram.write(this.reg[SP], value);

    }

    popHelper() {
        let val = this.ram.read(this.reg[SP]);
        this.reg[SP]++;

        return val;
    }

    CALL(regNum) {
        this.pushHelper(this.reg.PC + 2);

        return this.reg[regNum];
    }


    PUSH(regNum, flag) {
        let value = this.reg[regNum];

        this.pushHelper(value);
    }

    POP(regNum) {
        let val = this.popHelper();

        this.reg[regNum] = val;
    }

    RET() {
        return this.popHelper();

    }

    CMP(regA, regB) {
        this.alu('CMP', regA, regB);
    }




}

module.exports = CPU;
