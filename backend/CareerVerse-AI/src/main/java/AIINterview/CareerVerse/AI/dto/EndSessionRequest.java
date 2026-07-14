package AIINterview.CareerVerse.AI.dto;

public record EndSessionRequest(
        Integer integrityScore,
        Integer warningsCount,
        Integer eyeContactPercentage,
        Integer facePresentPercentage,
        String multipleFacesDetected,
        String phoneChecked,
        Integer tabSwitches
) {}
