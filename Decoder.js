function Decoder(bytes, port) {

    function Unsigned1Byte(index) {
    return bytes[index];
    }

    function Unsigned2Byte(index) {
    return (bytes[index]  << 8) + bytes[index + 1];
    }

    function Unsigned3Byte(index) {
    return (bytes[index]  << 16) + (bytes[index + 1] << 8) + bytes[index + 2];
    }

    function Signed1Byte(index) {
    num = Unsigned1Byte(index);
    if (num > 0x7F)
         num = num - 0x100;
    return num;
    }

    function Signed2Byte(index) {
    num = Unsigned2Byte(index);
    if (num > 0x7FFF)
         num = num - 0x10000;
    return num;
    }

    function Signed3Byte(index) {
    num = Unsigned3Byte(index);
    if (num > 0x7FFFFF)
         num = num - 0x1000000;
    return num;
    }

    var decoded = {};

    var len = bytes.length;
    var offset = 0;
    var channel;

    while (offset < len) {
         Channel = bytes[offset];
         switch(bytes[offset + 1]) { // switch on Data type
         case 0x00: // Digital Input - unsigned 1 byte
              val = Unsigned1Byte(offset + 2);
              switch(Channel) {
              case 4:
                   decoded.sats = val;
                   break;
              case 6:
                   decoded.heading = val;
                   break;
              default:
                   decoded.DigitalInput = val;
                   break;
              } 
              offset += 3;
              break;
         case 0x01: // Digital Output - unsigned 1 byte
              decoded.DigitalOutput = Unsigned1Byte(offset + 2);
              offset += 3;
              break;
         case 0x02: // Analog Input - unsigned 2 byte 0.01 resolution
              val = Unsigned2Byte(offset + 2) / 100;
              switch(Channel) {
              case 3:
                   decoded.battery = val;
                   break;
              case 5:
                   decoded.speed = val;
                   break;
              default:
                   decoded.AnalogInput = val;
              }
              offset += 4;
              break;
         case 0x03: // Analog Output - unsigned 2 byte 0.01 resolution
              decoded.AnalogOutput = Unsigned2Byte(offset + 2) / 100;
              offset += 4;
              break;
         case 0x65: // Illuminance Sensor - unsigned 2 byte
              decoded.illuminance = Unsigned2Byte(offset + 2);
              offset += 4;
              break;
         case 0x66: // Presence Sensor - unsigned 1 byte
              decoded.presence = Unsigned1Byte(offset + 2);
              offset += 3;
              break;
         case 0x67: // Temperature Sensor - 2 byte 0.1°C Signed
              decoded.temp = Signed2Byte(offset + 2) /10;
              offset += 4;
              break;	
         case 0x68: // Humidity Sensor - 1 byte 0.5% unsigned
              decoded.humidity = Unsigned1Byte(offset + 2) / 2;
              offset += 3;
              break;
         case 0x71: // Accelerometer - 3x 0.001 G 2 byte Signed per axis
              decoded.accel_x = Signed2Byte(offset + 2) / 1000;
              decoded.accel_y = Signed2Byte(offset + 4) / 1000;
              decoded.accel_z = Signed2Byte(offset + 6) / 1000;
              offset += 8;
              break;
         case 0x73: // Barometer - 0.1 hPa 2 byte Unsigned
              decoded.ext_pressure = Unsigned2Byte(offset + 2) / 10;
              offset += 4;
              break;
         case 0x86: // Gyrometer - 3x 2 Byte - 0.01 deg/s Signed per axis
              decoded.gyro_x = Signed2Byte(offset + 2) / 100;
              decoded.gyro_y = Signed2Byte(offset + 4) / 100;
              decoded.gyro_z = Signed2Byte(offset + 6) / 100;
              offset += 8;
              break;
         case 0x88: // GPS - lat/lon 3byte  0.0001 deg Signed,  3 byte signed Altitude 0.01 meter
              decoded.latitude  = Signed3Byte(offset + 2) / 10000;
              decoded.longitude = Signed3Byte(offset + 5) / 10000;
              decoded.altitude  = Signed3Byte(offset + 8) / 100;
              offset += 11;
              break;
         }
    }

    return decoded;
}
