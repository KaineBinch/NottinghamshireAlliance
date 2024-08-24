import { teeTimes } from "../constants/teeTimes";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

function TeeTimesTable() {
  return (
    <>
      <TableContainer component={Paper} style={{ marginTop: 20 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Names</TableCell>
              <TableCell>Club</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teeTimes.map((teeTime, index) => (
              <TableRow key={index}>
                <TableCell>{teeTime.time}</TableCell>
                <TableCell>
                  {teeTime.names.map((player, i) => (
                    <div key={i}>
                      {player.name}
                      {player.isSenior && (
                        <span className="text-sm font-semibold"> (S) </span>
                      )}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {teeTime.names.map((player, i) => (
                    <div key={i}>{player.club}</div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default TeeTimesTable;
